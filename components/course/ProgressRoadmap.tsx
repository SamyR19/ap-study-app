'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Lock, Target, Flame, Code, Trophy } from 'lucide-react';
import type { UnitProgress, Milestone } from '@/types/course';
import { UNIT_INFO } from '@/types/course';
import { cn } from '@/lib/utils';

interface ProgressRoadmapProps {
  unitProgressList: UnitProgress[];
  currentUnit: number;
  milestones: Milestone[];
  className?: string;
}

const milestoneIcons: Record<string, React.ElementType> = {
  unit_complete: Target,
  streak: Flame,
  challenges: Code,
  mastery: Trophy,
};

export function ProgressRoadmap({
  unitProgressList,
  currentUnit,
  milestones,
  className,
}: ProgressRoadmapProps) {
  // Calculate overall progress
  const totalTopics = unitProgressList.reduce((sum, u) => sum + u.topics_count, 0);
  const masteredTopics = unitProgressList.reduce((sum, u) => sum + u.topics_mastered, 0);
  const overallProgress = totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0;

  return (
    <div className={cn('bg-card rounded-xl border border-border p-6', className)}>
      <h3 className="font-semibold text-foreground mb-4">Your AP CSA Roadmap</h3>

      {/* Overall progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Overall Progress</span>
          <span className="text-sm font-medium text-foreground">{overallProgress}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Unit roadmap visualization */}
      <div className="relative">
        {/* Connection line */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-muted" />
        <motion.div
          className="absolute top-6 left-6 h-0.5 bg-primary"
          initial={{ width: 0 }}
          animate={{
            width: `${Math.min(
              ((currentUnit - 1) / 3) * 100,
              100
            )}%`,
          }}
          transition={{ duration: 1, delay: 0.5 }}
        />

        {/* Unit nodes */}
        <div className="flex justify-between relative">
          {UNIT_INFO.map((unit, index) => {
            const progress = unitProgressList.find(
              (p) => p.unit_number === unit.number
            );
            const isComplete = (progress?.overall_mastery ?? 0) >= 100;
            const isCurrent = unit.number === currentUnit;
            const isLocked = unit.number > currentUnit + 1;

            return (
              <motion.div
                key={unit.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                className="flex flex-col items-center"
              >
                {/* Node circle */}
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center relative z-10 border-2',
                    isComplete && 'bg-green-500 border-green-500 text-white',
                    isCurrent && !isComplete && 'bg-card border-primary',
                    !isCurrent && !isComplete && !isLocked && 'bg-muted border-border',
                    isLocked && 'bg-muted border-border'
                  )}
                  style={
                    isCurrent && !isComplete
                      ? { boxShadow: `0 0 0 4px ${unit.color}30` }
                      : undefined
                  }
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : isLocked ? (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  ) : isCurrent ? (
                    <span
                      className="font-bold text-lg"
                      style={{ color: unit.color }}
                    >
                      {unit.number}
                    </span>
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                {/* Unit label */}
                <div className="mt-3 text-center">
                  <p
                    className={cn(
                      'text-xs font-medium',
                      isCurrent ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    Unit {unit.number}
                  </p>
                  <p className="text-xs text-muted-foreground hidden sm:block mt-0.5">
                    {unit.shortName}
                  </p>
                </div>

                {/* Progress percentage */}
                <div
                  className={cn(
                    'mt-2 text-xs font-medium px-2 py-0.5 rounded-full',
                    isComplete && 'bg-green-500/20 text-green-600 dark:text-green-400',
                    isCurrent && !isComplete && 'bg-primary/20 text-primary',
                    !isCurrent && !isComplete && 'bg-muted text-muted-foreground'
                  )}
                >
                  {progress?.overall_mastery ?? 0}%
                </div>

                {/* Current indicator */}
                {isCurrent && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-xs font-medium text-primary"
                  >
                    You are here
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Milestones section */}
      <div className="mt-8 pt-6 border-t border-border">
        <h4 className="font-medium text-foreground mb-3">Milestones</h4>
        <div className="grid grid-cols-2 gap-3">
          {milestones.slice(0, 4).map((milestone) => {
            const Icon = milestoneIcons[milestone.type] || Target;
            return (
              <div
                key={milestone.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg',
                  milestone.is_completed
                    ? 'bg-green-500/10 dark:bg-green-500/20'
                    : 'bg-muted'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  milestone.is_completed
                    ? 'bg-green-500/20'
                    : 'bg-muted-foreground/10'
                )}>
                  <Icon className={cn(
                    'w-4 h-4',
                    milestone.is_completed
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-muted-foreground'
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium truncate',
                      milestone.is_completed
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-foreground'
                    )}
                  >
                    {milestone.title}
                  </p>
                  {milestone.is_completed ? (
                    <p className="text-xs text-green-600 dark:text-green-400">Completed!</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {milestone.description}
                    </p>
                  )}
                </div>
                {milestone.is_completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground/30 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
