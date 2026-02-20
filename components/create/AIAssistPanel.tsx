'use client';

import { useState } from 'react';
import { Sparkles, Send, Loader2, X } from 'lucide-react';

interface AIAssistPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (flashcards: { front: string; back: string }[]) => void;
  existingTerms?: string[];
}

export function AIAssistPanel({
  isOpen,
  onClose,
  onGenerate,
  existingTerms = [],
}: AIAssistPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: prompt,
          count,
          existingTerms,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const data = await response.json();
      if (data.flashcards && Array.isArray(data.flashcards)) {
        onGenerate(data.flashcards);
        setPrompt('');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-white border-l border-cream-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cream-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-500" />
          </div>
          <div>
            <h3 className="font-semibold text-charcoal">AI Smart Assist</h3>
            <p className="text-xs text-charcoal-light">Generate flashcards</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-cream-100 transition-colors"
        >
          <X className="w-5 h-5 text-charcoal-light" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {/* Count selector */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Number of cards to generate
            </label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-cream-200 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={3}>3 cards</option>
              <option value={5}>5 cards</option>
              <option value={10}>10 cards</option>
              <option value={15}>15 cards</option>
              <option value={20}>20 cards</option>
            </select>
          </div>

          {/* Prompt textarea */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Describe what you want to study
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Java arrays and ArrayList methods' or paste your notes here..."
              className="w-full h-40 px-3 py-2 rounded-lg border border-cream-200 bg-white text-charcoal placeholder:text-charcoal-light/50 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Tips */}
          <div className="bg-cream-50 rounded-lg p-3">
            <p className="text-xs font-medium text-charcoal mb-1">Tips:</p>
            <ul className="text-xs text-charcoal-light space-y-1">
              <li>• Paste your notes or textbook content</li>
              <li>• Describe a topic to generate cards</li>
              <li>• Be specific for better results</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-cream-200">
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Generate Cards
            </>
          )}
        </button>
      </div>
    </div>
  );
}
