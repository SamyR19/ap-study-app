'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Play,
  Clock,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trophy,
  RotateCcw,
  Copy,
  Terminal,
  StickyNote,
  PanelRightOpen,
  PanelRightClose,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PracticeTest, PracticeTestQuestion, PracticeTestAnswer } from '@/types/study-tools';
import Editor from '@monaco-editor/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/providers/ThemeProvider';

// Local storage key for saving progress
const getProgressKey = (testId: string) => `practice-test-progress-${testId}`;

type Mode = 'preview' | 'taking' | 'results';

// Code block component for displaying code in questions
const CodeBlock = ({ language, children, isDark }: { language: string; children: string; isDark?: boolean }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-border bg-muted/50">
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs text-muted-foreground font-medium">{language || 'code'}</span>
        <button
          onClick={copyCode}
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>
      <div className="px-4 pb-4 overflow-x-auto">
        <SyntaxHighlighter
          language={language || 'java'}
          style={isDark ? oneDark : oneLight}
          showLineNumbers={false}
          wrapLines={false}
          customStyle={{
            margin: 0,
            padding: 0,
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: '1.7',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            },
          }}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

// Parse question text to separate text and code blocks
const parseQuestionContent = (text: string): { type: 'text' | 'code'; content: string; language?: string }[] => {
  const parts: { type: 'text' | 'code'; content: string; language?: string }[] = [];
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const textContent = text.slice(lastIndex, match.index).trim();
      if (textContent) {
        parts.push({ type: 'text', content: textContent });
      }
    }

    // Add code block
    parts.push({
      type: 'code',
      content: match[2].trim(),
      language: match[1] || 'java',
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const textContent = text.slice(lastIndex).trim();
    if (textContent) {
      parts.push({ type: 'text', content: textContent });
    }
  }

  // If no code blocks found, return original text
  if (parts.length === 0) {
    parts.push({ type: 'text', content: text });
  }

  return parts;
};

export default function PracticeTestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const testId = params.id as string;
  const autoStart = searchParams.get('start') === 'true';
  const resumeTest = searchParams.get('resume') === 'true';
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [test, setTest] = useState<PracticeTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<Mode>(autoStart || resumeTest ? 'taking' : 'preview');
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  // Test taking state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, PracticeTestAnswer>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Results state
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);

  // Code execution state
  const [showOutputModal, setShowOutputModal] = useState(false);
  const [codeOutput, setCodeOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [outputError, setOutputError] = useState<string | null>(null);
  const [stdinInput, setStdinInput] = useState('');

  // Scratchpad state (per question)
  const [scratchpadNotes, setScratchpadNotes] = useState<Map<number, string>>(new Map());
  const [showScratchpad, setShowScratchpad] = useState(true);

  // Get scratchpad note for current question
  const getCurrentScratchpad = () => scratchpadNotes.get(currentIndex) || '';
  const updateScratchpad = (value: string) => {
    setScratchpadNotes(prev => {
      const newMap = new Map(prev);
      newMap.set(currentIndex, value);
      return newMap;
    });
  };

  // Extract variable names from code in the question
  const extractVariablesFromQuestion = (question: PracticeTestQuestion): Set<string> => {
    const variables = new Set<string>();
    const questionText = question.question || '';

    // Extract code blocks from question
    const codeBlockRegex = /```\w*\n([\s\S]*?)```/g;
    let match;
    let allCode = '';

    while ((match = codeBlockRegex.exec(questionText)) !== null) {
      allCode += match[1] + '\n';
    }

    // Java variable declaration patterns
    const patterns = [
      // int x, double y, String name, boolean flag, char c, etc.
      /\b(?:int|double|float|long|short|byte|char|boolean|String|Integer|Double|Boolean)\s+(\w+)/g,
      // int[] arr, String[] args
      /\b(?:int|double|float|long|short|byte|char|boolean|String|Integer|Double|Boolean)\s*\[\s*\]\s*(\w+)/g,
      // ArrayList<Type> list, HashMap<K,V> map
      /\b(?:ArrayList|List|HashMap|Map|Set|HashSet)\s*<[^>]*>\s+(\w+)/g,
      // for (int i = 0; ...)
      /\bfor\s*\(\s*(?:int|double|float|long|short|byte|char)\s+(\w+)/g,
      // Common loop variables that might not be declared in visible code
    ];

    for (const pattern of patterns) {
      let varMatch;
      while ((varMatch = pattern.exec(allCode)) !== null) {
        if (varMatch[1] && varMatch[1].length > 0) {
          variables.add(varMatch[1]);
        }
      }
    }

    return variables;
  };

  // Render scratchpad content with variable highlighting
  const renderScratchpadContent = (text: string, variables: Set<string>) => {
    if (!text) return null;
    if (variables.size === 0) return <span>{text}</span>;

    // Create regex pattern for all variables
    const varPattern = Array.from(variables).map(v => `\\b${v}\\b`).join('|');
    const regex = new RegExp(`(${varPattern})`, 'g');

    const parts = text.split(regex);
    return parts.map((part, index) => {
      if (variables.has(part)) {
        return (
          <span
            key={index}
            className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-mono text-sm font-medium"
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Save progress to localStorage
  const saveProgress = () => {
    if (!testId) return;
    const progressData = {
      currentIndex,
      answers: Array.from(answers.entries()),
      timeRemaining,
      scratchpadNotes: Array.from(scratchpadNotes.entries()),
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(getProgressKey(testId), JSON.stringify(progressData));
  };

  // Load progress from localStorage
  const loadProgress = () => {
    if (!testId) return null;
    const saved = localStorage.getItem(getProgressKey(testId));
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return {
          currentIndex: data.currentIndex,
          answers: new Map(data.answers),
          timeRemaining: data.timeRemaining,
          scratchpadNotes: data.scratchpadNotes ? new Map(data.scratchpadNotes) : new Map(),
          savedAt: new Date(data.savedAt),
        };
      } catch {
        return null;
      }
    }
    return null;
  };

  // Clear saved progress
  const clearProgress = () => {
    if (!testId) return;
    localStorage.removeItem(getProgressKey(testId));
    setHasSavedProgress(false);
  };

  // Check for saved progress on load
  useEffect(() => {
    const saved = loadProgress();
    if (saved) {
      setHasSavedProgress(true);
      if (resumeTest) {
        setCurrentIndex(saved.currentIndex);
        setAnswers(saved.answers);
        setTimeRemaining(saved.timeRemaining);
        if (saved.scratchpadNotes) {
          setScratchpadNotes(saved.scratchpadNotes);
        }
      }
    }
  }, [testId, resumeTest]);

  // Auto-save progress periodically
  useEffect(() => {
    if (mode === 'taking') {
      const interval = setInterval(() => {
        saveProgress();
      }, 10000); // Save every 10 seconds
      return () => clearInterval(interval);
    }
  }, [mode, currentIndex, answers, timeRemaining, scratchpadNotes]);

  useEffect(() => {
    loadTestData();
  }, [testId]);

  useEffect(() => {
    // Start timer if test has time limit
    if (mode === 'taking' && test?.settings?.timerMinutes && timeRemaining === null) {
      setTimeRemaining(test.settings.timerMinutes * 60);
    }

    if (mode === 'taking' && timeRemaining !== null && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [mode, test]);

  const loadTestData = async () => {
    try {
      const { data, error } = await supabase
        .from('practice_tests')
        .select('*')
        .eq('id', testId)
        .single();

      if (error) throw error;
      setTest(data);
    } catch (error) {
      console.error('Error loading practice test:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startTest = () => {
    clearProgress(); // Clear any saved progress when starting fresh
    setCurrentIndex(0);
    setAnswers(new Map());
    setScratchpadNotes(new Map());
    setTimeRemaining(test?.settings?.timerMinutes ? test.settings.timerMinutes * 60 : null);
    setStdinInput('');
    setMode('taking');
  };

  const handleMCQAnswer = (choiceIndex: number) => {
    const question = test!.questions[currentIndex];
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.set(currentIndex, {
        questionIndex: currentIndex,
        answer: choiceIndex,
        isCorrect: question.correctAnswerIndex === choiceIndex,
        pointsEarned: question.correctAnswerIndex === choiceIndex ? 1 : 0,
      });
      return newAnswers;
    });
  };

  const handleFRQAnswer = (text: string) => {
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.set(currentIndex, {
        questionIndex: currentIndex,
        answer: text,
      });
      return newAnswers;
    });
  };

  const runCode = async () => {
    const answer = answers.get(currentIndex);
    const code = typeof answer?.answer === 'string' ? answer.answer : '';

    if (!code.trim()) {
      setOutputError('No code to run. Please write some code first.');
      setShowOutputModal(true);
      return;
    }

    setIsRunning(true);
    setCodeOutput('');
    setOutputError(null);
    setShowOutputModal(true);

    try {
      const response = await fetch('/api/execute-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: 'java',
          stdin: stdinInput, // Pass stdin input for Scanner
        }),
      });

      const data = await response.json();

      if (data.error) {
        setOutputError(data.error);
      } else {
        setCodeOutput(data.output || 'Program completed with no output.');
      }
    } catch {
      setOutputError('Network error: Unable to connect to code execution service. Check your internet connection.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Calculate score
    let totalScore = 0;
    let totalMax = 0;

    test!.questions.forEach((question, index) => {
      const answer = answers.get(index);
      if (question.type === 'mcq') {
        totalMax += 1;
        if (answer?.isCorrect) {
          totalScore += 1;
        }
      } else if (question.type === 'frq') {
        const maxPoints = question.rubric?.reduce((sum, item) => sum + item.points, 0) || 5;
        totalMax += maxPoints;
        // For FRQ, we give partial credit based on answer length (simplified)
        if (answer?.answer && typeof answer.answer === 'string' && answer.answer.length > 50) {
          totalScore += Math.floor(maxPoints * 0.7); // 70% for attempting
        }
      }
    });

    setScore(totalScore);
    setMaxScore(totalMax);
    setMode('results');

    // Save attempt to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('practice_test_attempts').insert({
          user_id: user.id,
          test_id: testId,
          answers: Array.from(answers.values()),
          score: totalScore,
          max_score: totalMax,
          time_taken_seconds: test?.settings?.timerMinutes
            ? (test.settings.timerMinutes * 60) - (timeRemaining || 0)
            : null,
          completed_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error saving attempt:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="text-center py-16">
        <p className="text-foreground-light">Practice test not found</p>
      </div>
    );
  }

  const questions: PracticeTestQuestion[] = test.questions || [];
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers.get(currentIndex);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => mode === 'taking' ? setMode('preview') : router.push('/library/practice-tests')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{test.title}</h1>
            <p className="text-foreground-light">
              {questions.length} questions
              {test.settings?.timerMinutes && ` • ${test.settings.timerMinutes} minutes`}
            </p>
          </div>
        </div>

        {mode === 'taking' && timeRemaining !== null && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
            timeRemaining < 60 ? 'bg-red-100 text-red-600' : 'bg-muted text-foreground'
          }`}>
            <Clock className="w-5 h-5" />
            <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>

      {/* Preview Mode */}
      {mode === 'preview' && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
              <Play className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {hasSavedProgress ? 'Resume your test?' : 'Ready to start?'}
            </h2>
            <p className="text-muted-foreground mb-6">
              This test has {questions.length} questions.
              {test.settings?.timerMinutes && ` You'll have ${test.settings.timerMinutes} minutes to complete it.`}
            </p>
            <div className="flex items-center justify-center gap-3">
              {hasSavedProgress && (
                <>
                  <button
                    onClick={() => {
                      const saved = loadProgress();
                      if (saved) {
                        setCurrentIndex(saved.currentIndex);
                        setAnswers(saved.answers);
                        setTimeRemaining(saved.timeRemaining);
                        if (saved.scratchpadNotes) {
                          setScratchpadNotes(saved.scratchpadNotes);
                        }
                        setMode('taking');
                      }
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Resume ({loadProgress()?.currentIndex !== undefined ? loadProgress()!.currentIndex + 1 : 1}/{questions.length})
                  </button>
                  <button
                    onClick={() => {
                      clearProgress();
                      startTest();
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Start Over
                  </button>
                </>
              )}
              {!hasSavedProgress && (
                <button
                  onClick={startTest}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-medium hover:opacity-90 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Start Test
                </button>
              )}
            </div>
          </div>

          {/* Question Preview */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Questions Overview</h3>
            </div>
            <div className="divide-y divide-border">
              {questions.map((q, index) => (
                <div key={q.id} className="p-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-medium text-foreground">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground truncate">{q.question}</p>
                    <p className="text-sm text-foreground-light">
                      {q.type === 'mcq' ? 'Multiple Choice' : 'Free Response'} • {q.difficulty}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Taking Mode */}
      {mode === 'taking' && currentQuestion && (
        <div className="space-y-6">
          {/* Progress */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-foreground-light">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>

          {/* Question */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                currentQuestion.type === 'mcq'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-purple-100 text-purple-600'
              }`}>
                {currentQuestion.type === 'mcq' ? 'Multiple Choice' : 'Free Response'}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                currentQuestion.difficulty === 'easy'
                  ? 'bg-green-100 text-green-600'
                  : currentQuestion.difficulty === 'hard'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-amber-100 text-amber-600'
              }`}>
                {currentQuestion.difficulty}
              </span>
            </div>

            {/* Question Content with Code Blocks */}
            <div className="mb-6">
              {parseQuestionContent(currentQuestion.question).map((part, idx) => (
                part.type === 'text' ? (
                  <p key={idx} className="text-lg text-foreground">{part.content}</p>
                ) : (
                  <CodeBlock key={idx} language={part.language || 'java'}>
                    {part.content}
                  </CodeBlock>
                )
              ))}
            </div>

            {/* MCQ Choices */}
            {currentQuestion.type === 'mcq' && currentQuestion.choices && (
              <div className="space-y-3">
                {currentQuestion.choices.map((choice) => {
                  const choiceParts = parseQuestionContent(choice.text);
                  const hasCode = choiceParts.some(p => p.type === 'code');

                  return (
                    <button
                      key={choice.index}
                      onClick={() => handleMCQAnswer(choice.index)}
                      className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
                        currentAnswer?.answer === choice.index
                          ? 'border-foreground bg-muted'
                          : 'border-border hover:border-foreground-light'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium flex-shrink-0 ${
                        currentAnswer?.answer === choice.index
                          ? 'bg-foreground text-white'
                          : 'bg-muted text-foreground'
                      }`}>
                        {String.fromCharCode(65 + choice.index)}
                      </span>
                      <div className="flex-1 min-w-0">
                        {hasCode ? (
                          choiceParts.map((part, pIdx) => (
                            part.type === 'text' ? (
                              <span key={pIdx} className="text-foreground">{part.content}</span>
                            ) : (
                              <code
                                key={pIdx}
                                className="block bg-muted px-3 py-2 rounded-lg font-mono text-sm mt-2 overflow-x-auto"
                              >
                                {part.content}
                              </code>
                            )
                          ))
                        ) : (
                          <span className="text-foreground">{choice.text}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* FRQ Code Editor */}
            {currentQuestion.type === 'frq' && (
              <div className="space-y-4">
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="bg-muted px-4 py-2 border-b border-border flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Java</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowScratchpad(!showScratchpad)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                          showScratchpad
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                        }`}
                        title={showScratchpad ? 'Hide scratchpad' : 'Show scratchpad'}
                      >
                        <StickyNote className="w-4 h-4" />
                      </button>
                      <button
                        onClick={runCode}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-3 py-1.5 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50"
                      >
                        {isRunning ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Run
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <Editor
                    height="300px"
                    defaultLanguage="java"
                    value={typeof currentAnswer?.answer === 'string' ? currentAnswer.answer : ''}
                    onChange={(value) => handleFRQAnswer(value || '')}
                    theme={isDark ? 'vs-dark' : 'vs-light'}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 4,
                      wordWrap: 'on',
                      padding: { top: 16, bottom: 16 },
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
              >
                Submit Test
                <Check className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center gap-2 px-4 py-2 bg-foreground text-white rounded-xl hover:bg-foreground/90 transition-colors"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Mode */}
      {mode === 'results' && (
        <div className="space-y-6">
          {/* Score Summary */}
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-primary-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Test Complete!</h2>
            <p className="text-4xl font-bold text-foreground mb-1">
              {score} / {maxScore}
            </p>
            <p className="text-foreground-light mb-6">
              {Math.round((score / maxScore) * 100)}% correct
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={startTest}
                className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-xl hover:bg-muted transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Test
              </button>
              <button
                onClick={() => router.push('/library/practice-tests')}
                className="flex items-center gap-2 px-4 py-2 bg-foreground text-white rounded-xl hover:bg-foreground/90 transition-colors"
              >
                Back to Tests
              </button>
            </div>
          </div>

          {/* Question Review */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Review Answers</h3>
            </div>
            <div className="divide-y divide-border">
              {questions.map((q, index) => {
                const answer = answers.get(index);
                const isCorrect = q.type === 'mcq' && answer?.isCorrect;
                const questionParts = parseQuestionContent(q.question);

                return (
                  <div key={q.id} className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        q.type === 'mcq'
                          ? isCorrect
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                          : 'bg-muted text-foreground'
                      }`}>
                        {q.type === 'mcq' ? (
                          isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <div className="flex-1">
                        {/* Question with code blocks */}
                        <div className="mb-2">
                          {questionParts.map((part, pIdx) => (
                            part.type === 'text' ? (
                              <p key={pIdx} className="text-foreground font-medium">{part.content}</p>
                            ) : (
                              <CodeBlock key={pIdx} language={part.language || 'java'}>
                                {part.content}
                              </CodeBlock>
                            )
                          ))}
                        </div>

                        {q.type === 'mcq' && (
                          <div className="space-y-1 text-sm">
                            <p className="text-foreground-light">
                              Your answer: {answer?.answer !== undefined
                                ? q.choices?.[answer.answer as number]?.text || 'Not answered'
                                : 'Not answered'}
                            </p>
                            {!isCorrect && (
                              <p className="text-green-600">
                                Correct answer: {q.choices?.[q.correctAnswerIndex!]?.text}
                              </p>
                            )}
                          </div>
                        )}

                        {q.type === 'frq' && answer?.answer && (
                          <div className="bg-muted rounded-xl border border-border overflow-hidden">
                            <div className="bg-muted px-4 py-2 border-b border-border">
                              <span className="text-xs font-medium text-foreground-light">Your Code</span>
                            </div>
                            <pre className="p-4 text-sm font-mono overflow-x-auto">
                              {answer.answer as string}
                            </pre>
                          </div>
                        )}

                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-600 mb-1">Explanation:</p>
                          <p className="text-sm text-blue-800">{q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Code Output Modal */}
      <AnimatePresence>
        {showOutputModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOutputModal(false)}
              className="absolute inset-0 bg-black/30"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-card rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Output</h3>
                    <p className="text-sm text-foreground-light">
                      {isRunning ? 'Running code...' : 'Execution result'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOutputModal(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-foreground-light" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                {/* Scanner Input - show if Scanner detected in code */}
                {(() => {
                  const currentCode = typeof answers.get(currentIndex)?.answer === 'string'
                    ? answers.get(currentIndex)?.answer as string
                    : '';
                  const usesScanner = /\bScanner\b/.test(currentCode);
                  return usesScanner && (
                    <div className="border border-border rounded-xl overflow-hidden">
                      <div className="bg-muted px-4 py-2 border-b border-border flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-foreground">Input (for Scanner)</span>
                      </div>
                      <textarea
                        value={stdinInput}
                        onChange={(e) => setStdinInput(e.target.value)}
                        placeholder="Enter input here (each line is read by Scanner.nextLine())"
                        className="w-full h-20 px-4 py-3 bg-background text-foreground font-mono text-sm focus:outline-none resize-none placeholder:text-muted-foreground"
                      />
                    </div>
                  );
                })()}

                {/* Output */}
                {isRunning ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-foreground-light" />
                  </div>
                ) : outputError ? (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Error</p>
                    <pre className="text-sm text-red-700 dark:text-red-300 font-mono whitespace-pre-wrap">
                      {outputError}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-muted border border-border rounded-xl p-4">
                    <pre className="text-sm text-foreground font-mono whitespace-pre-wrap">
                      {codeOutput || 'No output'}
                    </pre>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-border flex justify-between">
                {(() => {
                  const currentCode = typeof answers.get(currentIndex)?.answer === 'string'
                    ? answers.get(currentIndex)?.answer as string
                    : '';
                  const usesScanner = /\bScanner\b/.test(currentCode);
                  return usesScanner && !isRunning && (
                    <button
                      onClick={runCode}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Run Again
                    </button>
                  );
                })()}
                <button
                  onClick={() => setShowOutputModal(false)}
                  className="px-4 py-2 bg-foreground text-white rounded-xl font-medium hover:bg-foreground/90 transition-colors ml-auto"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Scratchpad Panel */}
      <AnimatePresence>
        {showScratchpad && mode === 'taking' && currentQuestion?.type === 'frq' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-6 top-1/2 -translate-y-1/2 w-72 z-40"
          >
            {(() => {
              const questionVariables = extractVariablesFromQuestion(currentQuestion);
              return (
                <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-amber-50 dark:bg-amber-950/30 px-4 py-3 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StickyNote className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">Scratchpad</span>
                    </div>
                    <button
                      onClick={() => setShowScratchpad(false)}
                      className="p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                    >
                      <X className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </button>
                  </div>
                  {/* Variables detected */}
                  {questionVariables.size > 0 && (
                    <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border-b border-border">
                      <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Variables detected:</p>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(questionVariables).map(v => (
                          <span key={v} className="px-1.5 py-0.5 text-xs font-mono bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded">
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Scratchpad content with highlighting */}
                  <div className="relative">
                    {/* Rendered overlay with highlights */}
                    <div
                      className="absolute inset-0 px-3 py-2 pointer-events-none text-sm font-mono whitespace-pre-wrap leading-relaxed overflow-hidden"
                      aria-hidden="true"
                    >
                      {renderScratchpadContent(getCurrentScratchpad(), questionVariables)}
                    </div>
                    {/* Actual textarea (transparent text) */}
                    <textarea
                      value={getCurrentScratchpad()}
                      onChange={(e) => updateScratchpad(e.target.value)}
                      placeholder={questionVariables.size > 0
                        ? `Track values...\n${Array.from(questionVariables).slice(0, 3).map(v => `${v} = `).join('\n')}`
                        : 'Notes...'}
                      className="w-full px-3 py-2 bg-transparent text-transparent caret-foreground font-mono text-sm focus:outline-none resize-none placeholder:text-muted-foreground h-48"
                      style={{ caretColor: 'inherit' }}
                    />
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
