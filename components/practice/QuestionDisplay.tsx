'use client';

import { Badge } from '@/components/ui/badge';

interface QuestionDisplayProps {
  questionNumber: number;
  questionText: string;
  codeSnippet?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const difficultyConfig = {
  easy: { label: 'Easy', className: 'bg-success-light text-success-dark border-0' },
  medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700 border-0' },
  hard: { label: 'Hard', className: 'bg-red-100 text-red-700 border-0' },
};

export function QuestionDisplay({
  questionNumber,
  questionText,
  codeSnippet,
  difficulty,
}: QuestionDisplayProps) {
  const diffConfig = difficultyConfig[difficulty];

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-lg">
          {questionNumber}
        </div>
        <Badge className={diffConfig.className}>{diffConfig.label}</Badge>
      </div>

      {/* Question Text */}
      <div className="text-lg leading-[1.6] text-charcoal">{questionText}</div>

      {/* Code Snippet */}
      {codeSnippet && (
        <div className="rounded-xl bg-code-bg border border-cream-300 overflow-hidden">
          <div className="px-4 py-2 bg-cream-200 border-b border-cream-300 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-sm text-charcoal-light font-mono">Code</span>
          </div>
          <pre className="p-4 overflow-x-auto">
            <code className="font-mono text-sm leading-relaxed text-charcoal whitespace-pre">
              {codeSnippet}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
}
