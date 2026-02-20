'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Topic } from '@/types';
import type { MasteryLevel } from '@/types/course';
import { getMasteryInfo } from '@/types/course';
import { cn } from '@/lib/utils';

interface TopicCardProps {
  topic: Topic;
  masteryLevel: MasteryLevel;
  masteryPercentage: number;
  isPainPoint?: boolean;
  index?: number;
}

export function TopicCard({
  topic,
  masteryLevel,
  masteryPercentage,
  isPainPoint = false,
  index = 0,
}: TopicCardProps) {
  const masteryInfo = getMasteryInfo(masteryLevel);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
    >
      <Link href={`/course/topic/${topic.id}`}>
        <div
          className={cn(
            'group relative p-4 rounded-xl border transition-all duration-200',
            'bg-card hover:shadow-md hover:border-muted-foreground/40',
            isPainPoint && 'ring-2 ring-red-500/30 border-red-500/50'
          )}
        >
          {/* Pain point indicator */}
          {isPainPoint && (
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
          )}

          {/* Topic icon and name */}
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">{topic.icon}</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {topic.name}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {topic.conceptCount} concepts
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  color: masteryInfo.color,
                  backgroundColor: masteryInfo.bgColor,
                }}
              >
                {masteryInfo.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {masteryPercentage}%
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: masteryInfo.color }}
                initial={{ width: 0 }}
                animate={{ width: `${masteryPercentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 + 0.2 }}
              />
            </div>
          </div>

          {/* Difficulty badge */}
          <div className="mt-2 flex items-center gap-2">
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                topic.estimatedDifficulty === 'easy' && 'bg-green-500/20 text-green-600 dark:text-green-400',
                topic.estimatedDifficulty === 'medium' && 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
                topic.estimatedDifficulty === 'hard' && 'bg-red-500/20 text-red-600 dark:text-red-400'
              )}
            >
              {topic.estimatedDifficulty}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
