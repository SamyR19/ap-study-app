'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X, ArrowRight, RotateCcw, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackPanelProps {
  isCorrect: boolean;
  explanation: string;
  onNext: () => void;
  onReview: () => void;
}

export function FeedbackPanel({
  isCorrect,
  explanation,
  onNext,
  onReview,
}: FeedbackPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'rounded-2xl border-2 p-6 space-y-5',
        isCorrect
          ? 'bg-success-light border-success'
          : 'bg-red-50 border-error'
      )}
    >
      {/* Result Header */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            isCorrect ? 'bg-success' : 'bg-error'
          )}
        >
          {isCorrect ? (
            <Check className="w-6 h-6 text-white" />
          ) : (
            <X className="w-6 h-6 text-white" />
          )}
        </div>
        <div>
          <h3
            className={cn(
              'text-xl font-bold',
              isCorrect ? 'text-success-dark' : 'text-red-700'
            )}
          >
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </h3>
          <p className={cn(
            'text-sm',
            isCorrect ? 'text-success-dark/70' : 'text-red-600/70'
          )}>
            {isCorrect ? 'Great job!' : "Don't worry, let's learn from this"}
          </p>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-white/60 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-charcoal font-semibold">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Explanation
        </div>
        <p className="text-charcoal-light leading-relaxed">{explanation}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={onNext}
          className="flex-1 bg-charcoal hover:bg-charcoal/90 text-white rounded-xl h-12"
        >
          Next Question
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <Button
          onClick={onReview}
          variant="outline"
          className="border-cream-400 hover:bg-cream-100 rounded-xl h-12"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Review
        </Button>
      </div>
    </motion.div>
  );
}
