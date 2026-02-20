'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Code2, ArrowRight, Clock, Zap } from 'lucide-react';
import type { CodeChallenge, CodeChallengeProgress } from '@/types/course';
import { cn } from '@/lib/utils';

interface DueChallenge {
  challenge: CodeChallenge;
  progress: CodeChallengeProgress;
  dueIn: string; // "now", "2h", "tomorrow", etc.
}

interface SpacedRepetitionQueueProps {
  dueChallenges: DueChallenge[];
  className?: string;
}

export function SpacedRepetitionQueue({
  dueChallenges,
  className,
}: SpacedRepetitionQueueProps) {
  const hasDueChallenges = dueChallenges.length > 0;

  if (!hasDueChallenges) {
    return (
      <div
        className={cn(
          'bg-green-500/10 border border-green-500/20 rounded-xl p-4',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium text-green-700 dark:text-green-400">All caught up!</p>
            <p className="text-sm text-green-600 dark:text-green-500">
              No code challenges due. Great job staying on top of practice!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-gradient-to-r from-primary/10 to-orange-500/10 border border-primary/20 rounded-xl p-4',
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Code Practice Queue</p>
            <p className="text-sm text-muted-foreground">
              {dueChallenges.length} challenge{dueChallenges.length !== 1 ? 's' : ''}{' '}
              due for review
            </p>
          </div>
        </div>
        <Link
          href="/course/code-practice"
          className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-xl text-sm font-medium hover:opacity-90 transition-colors"
        >
          Start Practice
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Challenge previews */}
      <div className="space-y-2">
        {dueChallenges.slice(0, 3).map((item, index) => (
          <motion.div
            key={item.challenge.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/course/code-practice/${item.challenge.id}`}>
              <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:border-primary/50 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      item.dueIn === 'now' && 'bg-red-500',
                      item.dueIn !== 'now' && 'bg-yellow-500'
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.challenge.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.challenge.concepts_tested.slice(0, 2).join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      item.challenge.difficulty === 'easy' &&
                        'bg-green-500/20 text-green-600 dark:text-green-400',
                      item.challenge.difficulty === 'medium' &&
                        'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
                      item.challenge.difficulty === 'hard' &&
                        'bg-red-500/20 text-red-600 dark:text-red-400'
                    )}
                  >
                    {item.challenge.difficulty}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>
                      {item.dueIn === 'now' ? (
                        <span className="text-red-500 font-medium">Due now</span>
                      ) : (
                        item.dueIn
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {dueChallenges.length > 3 && (
        <Link
          href="/course/code-practice"
          className="block text-center text-sm text-primary hover:text-primary/80 mt-3"
        >
          View all {dueChallenges.length} challenges
        </Link>
      )}
    </div>
  );
}
