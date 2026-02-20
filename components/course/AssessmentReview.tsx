'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2, XCircle, BookOpen, ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import type { AssessmentResultData } from '@/lib/course-service';
import { cn } from '@/lib/utils';

interface AssessmentReviewProps {
  assessment: AssessmentResultData | null;
  curriculumVersion: '4-unit' | '9-unit';
}

export function AssessmentReview({ assessment }: AssessmentReviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!assessment) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">No Assessment Yet</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Take a diagnostic assessment to identify your strengths and areas for improvement.
            </p>
            <Link
              href="/course/onboarding"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium"
            >
              Take Assessment
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { score_percentage, total_questions, correct_answers, strong_topics, weak_topics, completed_at } = assessment;
  const completedDate = new Date(completed_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Determine score color
  const scoreColor =
    score_percentage >= 70 ? 'text-green-500' :
    score_percentage >= 50 ? 'text-yellow-500' :
    'text-red-500';

  const scoreBgColor =
    score_percentage >= 70 ? 'bg-green-500/10' :
    score_percentage >= 50 ? 'bg-yellow-500/10' :
    'bg-red-500/10';

  // Get unit numbers from topic IDs
  const getUnitFromTopicId = (topicId: string): number => {
    const match = topicId.match(/csa9?-(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const weakUnits = Array.from(new Set(weak_topics.map(getUnitFromTopicId)));
  const strongUnits = Array.from(new Set(strong_topics.map(getUnitFromTopicId)));

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center', scoreBgColor)}>
            <span className={cn('text-xl font-bold', scoreColor)}>
              {score_percentage}%
            </span>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">Assessment Results</h3>
            <p className="text-sm text-muted-foreground">
              {correct_answers}/{total_questions} correct • {completedDate}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Strong Areas</span>
                  </div>
                  {strongUnits.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {strongUnits.slice(0, 3).map((unit) => (
                        <span key={unit} className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-600 dark:text-green-400">
                          Unit {unit}
                        </span>
                      ))}
                      {strongUnits.length > 3 && (
                        <span className="text-xs text-green-600 dark:text-green-400">+{strongUnits.length - 3} more</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-green-600 dark:text-green-400">Keep practicing!</p>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">Focus Areas</span>
                  </div>
                  {weakUnits.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {weakUnits.slice(0, 3).map((unit) => (
                        <span key={unit} className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-600 dark:text-red-400">
                          Unit {unit}
                        </span>
                      ))}
                      {weakUnits.length > 3 && (
                        <span className="text-xs text-red-600 dark:text-red-400">+{weakUnits.length - 3} more</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-red-600 dark:text-red-400">Great job!</p>
                  )}
                </div>
              </div>

              {/* Weak Topic Links */}
              {weak_topics.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Topics to Review</h4>
                  <div className="space-y-2">
                    {weak_topics.slice(0, 3).map((topicId) => {
                      const unit = getUnitFromTopicId(topicId);
                      return (
                        <Link
                          key={topicId}
                          href={`/course/topic/${topicId}`}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-1.5 py-0.5 rounded bg-destructive/20 text-destructive font-medium">
                              U{unit}
                            </span>
                            <span className="text-sm text-foreground">{topicId}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Retake Button */}
              <Link
                href="/course/onboarding"
                className="flex items-center justify-center gap-2 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="w-4 h-4" />
                Retake Assessment
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
