'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Layers,
  BookOpen,
  Check,
  Sparkles,
  Loader2,
  Clock,
  Hash,
  FileQuestion,
  MessageSquare,
  Library,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FlashcardSet, StudyGuide } from '@/types/study-tools';

type SourceMode = 'prompt' | 'materials';

export default function CreatePracticeTestPage() {
  const router = useRouter();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [studyGuides, setStudyGuides] = useState<StudyGuide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Progress tracking
  const [generationProgress, setGenerationProgress] = useState<{
    current: number;
    total: number;
    status: string;
  } | null>(null);

  // Source mode
  const [sourceMode, setSourceMode] = useState<SourceMode>('prompt');
  const [promptText, setPromptText] = useState('');

  // Selected items
  const [selectedSets, setSelectedSets] = useState<Set<string>>(new Set());
  const [selectedGuides, setSelectedGuides] = useState<Set<string>>(new Set());

  // Settings
  const [questionCount, setQuestionCount] = useState(10);
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  const [useTimer, setUseTimer] = useState(false);
  const [includeMCQ, setIncludeMCQ] = useState(true);
  const [includeFRQ, setIncludeFRQ] = useState(false);
  const [mcqRatio, setMcqRatio] = useState(50); // Percentage of MCQ when both are selected

  useEffect(() => {
    loadUserContent();
  }, []);

  const loadUserContent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load flashcard sets
      const { data: setsData } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Load study guides
      const { data: guidesData } = await supabase
        .from('study_guides')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setFlashcardSets(setsData || []);
      setStudyGuides(guidesData || []);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSet = (id: string) => {
    setSelectedSets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleGuide = (id: string) => {
    setSelectedGuides(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleGenerate = async () => {
    // Validation based on source mode
    if (sourceMode === 'prompt' && !promptText.trim()) {
      setError('Please enter a topic or prompt');
      return;
    }

    if (sourceMode === 'materials' && selectedSets.size === 0 && selectedGuides.size === 0) {
      setError('Please select at least one study set or study guide');
      return;
    }

    if (!includeMCQ && !includeFRQ) {
      setError('Please select at least one question type');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress({ current: 0, total: questionCount, status: 'Starting...' });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const flashcardSetsContent: { id: string; cards: { front: string; back: string }[] }[] = [];
      let studyGuidesContent: { id: string; outline: unknown; quickReference: unknown }[] = [];

      if (sourceMode === 'materials') {
        // Load flashcard content for selected sets
        for (const setId of Array.from(selectedSets)) {
          const { data: cards } = await supabase
            .from('flashcards')
            .select('front, back')
            .eq('set_id', setId);

          if (cards) {
            flashcardSetsContent.push({ id: setId, cards });
          }
        }

        // Get study guide content
        studyGuidesContent = studyGuides
          .filter(g => selectedGuides.has(g.id))
          .map(g => ({
            id: g.id,
            outline: g.outline_content,
            quickReference: g.quick_reference,
          }));
      }

      // Generate practice test with streaming progress
      const questionTypes: ('mcq' | 'frq')[] = [];
      if (includeMCQ) questionTypes.push('mcq');
      if (includeFRQ) questionTypes.push('frq');

      const response = await fetch('/api/generate-practice-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceContent: sourceMode === 'prompt'
            ? { prompt: promptText }
            : { flashcardSets: flashcardSetsContent, studyGuides: studyGuidesContent },
          settings: {
            questionCount,
            timerMinutes: useTimer ? timerMinutes : null,
            questionTypes,
            mcqRatio: includeMCQ && includeFRQ ? mcqRatio : undefined,
          },
        }),
      });

      // Check if it's a streaming response
      const contentType = response.headers.get('Content-Type');

      if (contentType?.includes('text/event-stream')) {
        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullData = null;

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.type === 'progress') {
                    setGenerationProgress({
                      current: parsed.current,
                      total: parsed.total,
                      status: parsed.status,
                    });
                  } else if (parsed.type === 'complete') {
                    fullData = parsed.data;
                  } else if (parsed.type === 'error') {
                    throw new Error(parsed.message);
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }
        }

        if (!fullData) {
          throw new Error('Failed to receive complete response');
        }

        // Save to database
        const { data: testData, error: saveError } = await supabase
          .from('practice_tests')
          .insert({
            user_id: user.id,
            title: fullData.title,
            settings: {
              questionCount,
              timerMinutes: useTimer ? timerMinutes : null,
              questionTypes,
              mcqRatio: includeMCQ && includeFRQ ? mcqRatio : undefined,
            },
            source_set_ids: sourceMode === 'materials' ? Array.from(selectedSets) : [],
            source_guide_ids: sourceMode === 'materials' ? Array.from(selectedGuides) : [],
            questions: fullData.questions,
            ap_class: 'ap-csa',
          })
          .select()
          .single();

        if (saveError) throw saveError;
        router.push(`/library/practice-tests/${testData.id}`);
      } else {
        // Handle regular JSON response (fallback)
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || errorData.error || 'Failed to generate practice test');
        }

        const data = await response.json();

        // Save to database
        const { data: testData, error: saveError } = await supabase
          .from('practice_tests')
          .insert({
            user_id: user.id,
            title: data.title,
            settings: {
              questionCount,
              timerMinutes: useTimer ? timerMinutes : null,
              questionTypes,
              mcqRatio: includeMCQ && includeFRQ ? mcqRatio : undefined,
            },
            source_set_ids: sourceMode === 'materials' ? Array.from(selectedSets) : [],
            source_guide_ids: sourceMode === 'materials' ? Array.from(selectedGuides) : [],
            questions: data.questions,
            ap_class: 'ap-csa',
          })
          .select()
          .single();

        if (saveError) throw saveError;
        router.push(`/library/practice-tests/${testData.id}`);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  const totalSelected = selectedSets.size + selectedGuides.size;

  // Calculate MCQ/FRQ counts for display
  const mcqCount = includeMCQ && includeFRQ
    ? Math.round(questionCount * (mcqRatio / 100))
    : includeMCQ ? questionCount : 0;
  const frqCount = includeMCQ && includeFRQ
    ? questionCount - mcqCount
    : includeFRQ ? questionCount : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create practice test</h1>
          <p className="text-muted-foreground">Generate questions from your study materials</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Source Mode Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-xl">
            <button
              onClick={() => setSourceMode('prompt')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                sourceMode === 'prompt'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              From Prompt
            </button>
            <button
              onClick={() => setSourceMode('materials')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                sourceMode === 'materials'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Library className="w-4 h-4" />
              From Materials
            </button>
          </div>

          {sourceMode === 'prompt' ? (
            /* Prompt Input */
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-2">Enter a topic or prompt</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Describe what you want to be tested on. Be specific for better questions.
              </p>
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder='e.g., "Java arrays and ArrayLists", "Object-oriented programming concepts", "AP CSA Unit 6: Arrays"'
                className="w-full h-40 px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none placeholder:text-muted-foreground/60 bg-background text-foreground"
              />
              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 text-primary-500" />
                AI will generate AP-style questions based on your prompt
              </div>
            </div>
          ) : (
            /* Materials Selection */
            <>
              {/* Flashcard Sets */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-600" />
                    Study Sets
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {flashcardSets.length === 0 ? 'No study sets available' : 'Select study sets to include'}
                  </p>
                </div>

                {flashcardSets.length > 0 && (
                  <div className="divide-y divide-border max-h-60 overflow-y-auto">
                    {flashcardSets.map((set) => (
                      <label
                        key={set.id}
                        className="flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            selectedSets.has(set.id)
                              ? 'bg-foreground border-foreground'
                              : 'border-border'
                          }`}
                        >
                          {selectedSets.has(set.id) && <Check className="w-3 h-3 text-background" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedSets.has(set.id)}
                          onChange={() => toggleSet(set.id)}
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{set.title}</p>
                          <p className="text-sm text-muted-foreground">{set.card_count} cards</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Study Guides */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    Study Guides
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {studyGuides.length === 0 ? 'No study guides available' : 'Select study guides to include'}
                  </p>
                </div>

                {studyGuides.length > 0 && (
                  <div className="divide-y divide-border max-h-60 overflow-y-auto">
                    {studyGuides.map((guide) => (
                      <label
                        key={guide.id}
                        className="flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            selectedGuides.has(guide.id)
                              ? 'bg-foreground border-foreground'
                              : 'border-border'
                          }`}
                        >
                          {selectedGuides.has(guide.id) && <Check className="w-3 h-3 text-background" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedGuides.has(guide.id)}
                          onChange={() => toggleGuide(guide.id)}
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{guide.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {guide.outline_content?.sections?.length || 0} sections
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold text-foreground mb-4">Test Settings</h3>

            {/* Question Count */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Hash className="w-4 h-4" />
                Number of questions
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={5}>5 questions</option>
                <option value={10}>10 questions</option>
                <option value={15}>15 questions</option>
                <option value={20}>20 questions</option>
                <option value={30}>30 questions</option>
                <option value={50}>50 questions</option>
              </select>
            </div>

            {/* Timer */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Clock className="w-4 h-4" />
                Timer (optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useTimer}
                    onChange={(e) => setUseTimer(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      useTimer ? 'bg-foreground border-foreground' : 'border-border'
                    }`}
                  >
                    {useTimer && <Check className="w-3 h-3 text-background" />}
                  </div>
                  <span className="text-sm text-foreground">Enable timer</span>
                </label>
              </div>
              {useTimer && (
                <input
                  type="number"
                  value={timerMinutes || ''}
                  onChange={(e) => setTimerMinutes(Number(e.target.value) || null)}
                  placeholder="Minutes"
                  min={1}
                  max={180}
                  className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              )}
            </div>

            {/* Question Types */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <FileQuestion className="w-4 h-4" />
                Question types
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeMCQ}
                    onChange={(e) => setIncludeMCQ(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      includeMCQ ? 'bg-foreground border-foreground' : 'border-border'
                    }`}
                  >
                    {includeMCQ && <Check className="w-3 h-3 text-background" />}
                  </div>
                  <span className="text-sm text-foreground">Multiple choice</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeFRQ}
                    onChange={(e) => setIncludeFRQ(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      includeFRQ ? 'bg-foreground border-foreground' : 'border-border'
                    }`}
                  >
                    {includeFRQ && <Check className="w-3 h-3 text-background" />}
                  </div>
                  <span className="text-sm text-foreground">Free response (FRQ)</span>
                </label>
              </div>
            </div>

            {/* MCQ/FRQ Ratio Slider - Only show when both are selected */}
            {includeMCQ && includeFRQ && (
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Question ratio
                </label>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-muted-foreground w-12">MCQ</span>
                  <input
                    type="range"
                    min={10}
                    max={90}
                    step={10}
                    value={mcqRatio}
                    onChange={(e) => setMcqRatio(Number(e.target.value))}
                    className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-foreground"
                  />
                  <span className="text-xs text-muted-foreground w-12 text-right">FRQ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600 font-medium">{mcqCount} MCQ</span>
                  <span className="text-purple-600 font-medium">{frqCount} FRQ</span>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Generation Progress */}
          {isGenerating && generationProgress && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {generationProgress.status}
                </span>
              </div>
              <div className="w-full h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-300"
                  style={{ width: `${(generationProgress.current / generationProgress.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 text-center">
                {generationProgress.current} / {generationProgress.total} questions
              </p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || (sourceMode === 'prompt' ? !promptText.trim() : totalSelected === 0)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-foreground text-background rounded-xl font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {sourceMode === 'prompt' ? 'Generate Test' : `Generate Test (${totalSelected} selected)`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
