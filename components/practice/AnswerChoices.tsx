'use client';

import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface Choice {
  index: number;
  text: string;
}

interface AnswerChoicesProps {
  choices: Choice[];
  selectedIndex: number | null;
  correctIndex?: number;
  isSubmitted: boolean;
  onSelect: (index: number) => void;
}

const letterLabels = ['A', 'B', 'C', 'D', 'E'];

export function AnswerChoices({
  choices,
  selectedIndex,
  correctIndex,
  isSubmitted,
  onSelect,
}: AnswerChoicesProps) {
  const getChoiceState = (index: number) => {
    if (!isSubmitted) {
      return selectedIndex === index ? 'selected' : 'default';
    }
    if (index === correctIndex) return 'correct';
    if (index === selectedIndex && index !== correctIndex) return 'incorrect';
    return 'default';
  };

  const stateStyles = {
    default: 'border-cream-300 bg-white hover:bg-secondary-100 hover:border-cream-400',
    selected: 'border-primary-500 bg-secondary-100 ring-2 ring-primary-200',
    correct: 'border-success bg-success-light',
    incorrect: 'border-error bg-red-50',
  };

  return (
    <div className="space-y-3">
      {choices.map((choice) => {
        const state = getChoiceState(choice.index);
        const isSelected = selectedIndex === choice.index;
        const isCorrect = isSubmitted && choice.index === correctIndex;
        const isIncorrect = isSubmitted && isSelected && choice.index !== correctIndex;

        return (
          <button
            key={choice.index}
            onClick={() => !isSubmitted && onSelect(choice.index)}
            disabled={isSubmitted}
            className={cn(
              'w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-start gap-4',
              stateStyles[state],
              !isSubmitted && 'cursor-pointer',
              isSubmitted && 'cursor-default'
            )}
          >
            {/* Letter Label */}
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm flex-shrink-0',
                state === 'default' && 'bg-cream-200 text-charcoal',
                state === 'selected' && 'bg-primary-500 text-white',
                state === 'correct' && 'bg-success text-white',
                state === 'incorrect' && 'bg-error text-white'
              )}
            >
              {isCorrect ? (
                <Check className="w-4 h-4" />
              ) : isIncorrect ? (
                <X className="w-4 h-4" />
              ) : (
                letterLabels[choice.index]
              )}
            </div>

            {/* Choice Text */}
            <span className={cn(
              'text-base leading-relaxed pt-0.5',
              state === 'correct' && 'text-success-dark font-medium',
              state === 'incorrect' && 'text-error font-medium',
              (state === 'default' || state === 'selected') && 'text-charcoal'
            )}>
              {choice.text}
            </span>
          </button>
        );
      })}
    </div>
  );
}
