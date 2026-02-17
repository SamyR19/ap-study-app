'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Check, X, ArrowRight, RotateCcw, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RubricScore {
  id: string;
  name: string;
  pointsEarned: number;
  pointsPossible: number;
  feedback: string;
  criteria: { description: string; met: boolean }[];
}

interface FRQFeedbackPanelProps {
  score: number;
  maxScore: number;
  rubricScores: RubricScore[];
  strengths: string[];
  improvements: string[];
  commonMistakes: string[];
  onTryAgain: () => void;
  onNext: () => void;
  isPremium?: boolean;
}

function getGradeBadge(percentage: number): { label: string; className: string } {
  if (percentage >= 90) return { label: 'Excellent', className: 'bg-success text-white' };
  if (percentage >= 70) return { label: 'Good', className: 'bg-amber-500 text-white' };
  if (percentage >= 50) return { label: 'Fair', className: 'bg-orange-500 text-white' };
  return { label: 'Needs Work', className: 'bg-red-500 text-white' };
}

export function FRQFeedbackPanel({
  score,
  maxScore,
  rubricScores,
  strengths,
  improvements,
  commonMistakes,
  onTryAgain,
  onNext,
  isPremium = false,
}: FRQFeedbackPanelProps) {
  const percentage = Math.round((score / maxScore) * 100);
  const gradeBadge = getGradeBadge(percentage);

  // Calculate stroke offset for circular progress
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl border border-cream-300 shadow-lg overflow-hidden"
    >
      {/* Header with Score */}
      <div className="bg-gradient-to-r from-cream-100 to-cream-200 p-6 border-b border-cream-300">
        <div className="flex items-center gap-6">
          {/* Circular Progress */}
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r={radius}
                fill="none"
                stroke="#E8E4DD"
                strokeWidth="8"
              />
              <motion.circle
                cx="64"
                cy="64"
                r={radius}
                fill="none"
                stroke={percentage >= 70 ? '#6B9E78' : percentage >= 50 ? '#F59E0B' : '#D66B6B'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: strokeOffset }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-charcoal">{score}</span>
              <span className="text-sm text-charcoal-light">/ {maxScore}</span>
            </div>
          </div>

          {/* Score Details */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl font-bold text-charcoal">{percentage}%</span>
              <span className={cn('px-3 py-1 rounded-full text-sm font-semibold', gradeBadge.className)}>
                {gradeBadge.label}
              </span>
            </div>
            <p className="text-charcoal-light">
              You scored {score} out of {maxScore} points
            </p>
          </div>
        </div>
      </div>

      {/* Rubric Breakdown */}
      <div className="p-6 border-b border-cream-300">
        <h3 className="font-semibold text-charcoal mb-4">Rubric Breakdown</h3>
        <Accordion type="multiple" className="space-y-2">
          {rubricScores.map((rubric) => (
            <AccordionItem
              key={rubric.id}
              value={rubric.id}
              className="border border-cream-300 rounded-xl overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-cream-50 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <span className="font-medium text-charcoal">{rubric.name}</span>
                  <span
                    className={cn(
                      'text-sm font-semibold px-2 py-0.5 rounded',
                      rubric.pointsEarned === rubric.pointsPossible
                        ? 'bg-success-light text-success-dark'
                        : rubric.pointsEarned > 0
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    )}
                  >
                    {rubric.pointsEarned}/{rubric.pointsPossible}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  {/* Criteria */}
                  <div className="space-y-2">
                    {rubric.criteria.map((criterion, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        {criterion.met ? (
                          <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-error mt-0.5 flex-shrink-0" />
                        )}
                        <span
                          className={cn(
                            'text-sm',
                            criterion.met ? 'text-charcoal' : 'text-charcoal-light'
                          )}
                        >
                          {criterion.description}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Feedback */}
                  <div className="bg-cream-50 rounded-lg p-3 text-sm text-charcoal-light">
                    {rubric.feedback}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Feedback Sections */}
      <div className="p-6 space-y-6">
        {/* Strengths */}
        {strengths.length > 0 && (
          <div>
            <h4 className="font-semibold text-success-dark flex items-center gap-2 mb-3">
              <Check className="w-5 h-5" />
              What You Did Well
            </h4>
            <ul className="space-y-2">
              {strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-charcoal-light">
                  <span className="text-success mt-0.5">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {improvements.length > 0 && (
          <div>
            <h4 className="font-semibold text-amber-700 flex items-center gap-2 mb-3">
              <ArrowRight className="w-5 h-5" />
              Areas for Improvement
            </h4>
            <ul className="space-y-2">
              {improvements.map((improvement, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-charcoal-light">
                  <span className="text-amber-500 mt-0.5">•</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Common Mistakes */}
        {commonMistakes.length > 0 && (
          <div>
            <h4 className="font-semibold text-charcoal flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5" />
              Learning Points
            </h4>
            <ul className="space-y-2">
              {commonMistakes.map((mistake, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-charcoal-light">
                  <span className="text-charcoal-light mt-0.5">•</span>
                  {mistake}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 bg-cream-50 border-t border-cream-300 flex gap-3">
        <Button
          onClick={onTryAgain}
          variant="outline"
          className="flex-1 border-cream-400 hover:bg-cream-200 rounded-xl h-12"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 bg-primary-500 hover:bg-primary-600 text-white rounded-xl h-12"
        >
          Next Question
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        {isPremium && (
          <Button
            variant="ghost"
            className="text-charcoal-light hover:text-charcoal"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Disagree?
          </Button>
        )}
      </div>
    </motion.div>
  );
}
