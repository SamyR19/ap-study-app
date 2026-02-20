'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Upload,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type InputMode = 'text' | 'file';

export default function CreateStudyGuidePage() {
  const router = useRouter();
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charCount = text.length;
  const maxChars = 100000;

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Please enter some text to generate a study guide');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Generate study guide
      const response = await fetch('/api/generate-study-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate study guide');
      }

      const data = await response.json();

      // Save to database
      const { data: guideData, error: saveError } = await supabase
        .from('study_guides')
        .insert({
          user_id: user.id,
          title: data.title,
          source_text: text,
          source_type: 'text',
          outline_content: data.outline,
          quick_reference: data.quickReference,
          ap_class: 'ap-csa',
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Navigate to the study guide
      router.push(`/library/study-guides/${guideData.id}`);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-cream-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-charcoal" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Create study guide</h1>
          <p className="text-charcoal-light">Generate organized notes from your content</p>
        </div>
      </div>

      {/* Input Mode Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setInputMode('text')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
            inputMode === 'text'
              ? 'bg-charcoal text-white'
              : 'bg-cream-100 text-charcoal hover:bg-cream-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Paste text
        </button>
        <button
          onClick={() => setInputMode('file')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
            inputMode === 'file'
              ? 'bg-charcoal text-white'
              : 'bg-cream-100 text-charcoal hover:bg-cream-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload files
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
        {inputMode === 'text' ? (
          <div className="p-6">
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your notes, textbook content, or describe what you want to study..."
                className="w-full h-80 p-4 bg-cream-50 border border-cream-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-charcoal-light/50"
                maxLength={maxChars}
              />
              <div className="absolute bottom-4 right-4 text-sm text-charcoal-light">
                {charCount.toLocaleString()} / {maxChars.toLocaleString()}
              </div>
            </div>

            {/* Tips */}
            <div className="mt-4 p-4 bg-cream-50 rounded-xl">
              <p className="text-sm font-medium text-charcoal mb-2">Tips for better results:</p>
              <ul className="text-sm text-charcoal-light space-y-1">
                <li>• Paste complete sections from textbooks or notes</li>
                <li>• Include headers and subheadings if available</li>
                <li>• The more context you provide, the better the guide</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="border-2 border-dashed border-cream-300 rounded-xl p-12 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-charcoal-light" />
              <p className="text-charcoal font-medium mb-2">Drop files here or click to upload</p>
              <p className="text-sm text-charcoal-light mb-4">Supports PDF, DOCX, TXT (max 10MB)</p>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                id="file-upload"
                onChange={(e) => {
                  // TODO: Implement file upload
                  console.log(e.target.files);
                }}
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-cream-100 text-charcoal rounded-xl cursor-pointer hover:bg-cream-200 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Choose files
              </label>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-6 mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-cream-200 flex items-center justify-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !text.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Study Guide
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
