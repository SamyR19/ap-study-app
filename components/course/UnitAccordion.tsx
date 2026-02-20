'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Lock } from 'lucide-react';
import type { Topic } from '@/types';
import type { TopicProgress, UnitProgress } from '@/types/course';
import { getMasteryLevel } from '@/types/course';
import { TopicCard } from './TopicCard';
import { cn } from '@/lib/utils';

interface UnitAccordionProps {
  unitProgress: UnitProgress;
  topics: Topic[];
  topicProgressMap: Record<string, TopicProgress>;
  painPointTopicIds: string[];
  defaultOpen?: boolean;
  isLocked?: boolean;
}

export function UnitAccordion({
  unitProgress,
  topics,
  topicProgressMap,
  painPointTopicIds,
  defaultOpen = false,
  isLocked = false,
}: UnitAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen && !isLocked);

  return (
    <div className={cn(
      "rounded-xl border bg-card overflow-hidden",
      isLocked ? "border-border/50 opacity-60" : "border-border"
    )}>
      {/* Header */}
      <button
        onClick={() => !isLocked && setIsOpen(!isOpen)}
        disabled={isLocked}
        className={cn(
          "w-full p-4 flex items-center justify-between transition-colors",
          isLocked ? "cursor-not-allowed" : "hover:bg-accent/50"
        )}
      >
        <div className="flex items-center gap-4">
          {/* Unit number badge */}
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg",
              isLocked ? "bg-muted text-muted-foreground" : "text-white"
            )}
            style={{ backgroundColor: isLocked ? undefined : unitProgress.color }}
          >
            {isLocked ? <Lock className="w-5 h-5" /> : unitProgress.unit_number}
          </div>

          <div className="text-left">
            <h3 className={cn(
              "font-semibold",
              isLocked ? "text-muted-foreground" : "text-foreground"
            )}>
              Unit {unitProgress.unit_number}: {unitProgress.short_name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isLocked ? (
                <span>Complete earlier units to unlock</span>
              ) : (
                <>
                  {unitProgress.topics_count} topics
                  {unitProgress.topics_mastered > 0 && (
                    <span className="text-green-600 dark:text-green-400 ml-2">
                      {unitProgress.topics_mastered} mastered
                    </span>
                  )}
                  {unitProgress.topics_in_progress > 0 && (
                    <span className="text-blue-600 dark:text-blue-400 ml-2">
                      {unitProgress.topics_in_progress} in progress
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress bar - hide if locked */}
          {!isLocked && (
            <div className="hidden sm:block w-32">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className="text-xs font-medium text-foreground">
                  {unitProgress.overall_mastery}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${unitProgress.overall_mastery}%`,
                    backgroundColor: unitProgress.color,
                  }}
                />
              </div>
            </div>
          )}

          {/* Chevron or Lock */}
          {isLocked ? (
            <Lock className="w-5 h-5 text-muted-foreground" />
          ) : (
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          )}
        </div>
      </button>

      {/* Topics grid - only show if not locked */}
      <AnimatePresence>
        {isOpen && !isLocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-4">
                {topics.map((topic, index) => {
                  const progress = topicProgressMap[topic.id];
                  const masteryPercentage = progress?.mastery_percentage ?? 0;
                  const masteryLevel = getMasteryLevel(masteryPercentage);
                  const isPainPoint = painPointTopicIds.includes(topic.id);

                  return (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      masteryLevel={masteryLevel}
                      masteryPercentage={masteryPercentage}
                      isPainPoint={isPainPoint}
                      index={index}
                    />
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
