'use client';

import { ArrowRight, Play, BookOpen, Code2 } from 'lucide-react';
import Link from 'next/link';
import type { TopicProgress, UnitProgress } from '@/types/course';
import type { Topic } from '@/types';

interface NextStepCardProps {
  unitProgressList: UnitProgress[];
  currentUnit: number;
  topicProgressMap: Record<string, TopicProgress>;
  topics: Topic[];
  painPointTopicIds: string[];
}

export function NextStepCard({
  unitProgressList,
  currentUnit,
  topicProgressMap,
  topics,
  painPointTopicIds,
}: NextStepCardProps) {
  // Determine the next step:
  // 1. Pain point topic (highest priority if any)
  // 2. In-progress topic (continue where left off)
  // 3. Next topic in current unit
  // 4. First topic in next unit

  // Find topics in current unit
  const currentUnitTopics = topics.filter((t) => {
    const unitNum = parseInt(t.id.match(/csa9?-(\d+)/)?.[1] || '0');
    return unitNum === currentUnit;
  });

  // Check for pain point topics
  const painPointTopic = painPointTopicIds.length > 0
    ? topics.find((t) => t.id === painPointTopicIds[0])
    : null;

  // Find in-progress topic (most recently studied)
  const inProgressTopics = currentUnitTopics
    .filter((t) => {
      const progress = topicProgressMap[t.id];
      return progress && progress.mastery_level !== 'not_started' && progress.mastery_level !== 'mastered';
    })
    .sort((a, b) => {
      const aProgress = topicProgressMap[a.id];
      const bProgress = topicProgressMap[b.id];
      const aDate = aProgress?.last_studied ? new Date(aProgress.last_studied).getTime() : 0;
      const bDate = bProgress?.last_studied ? new Date(bProgress.last_studied).getTime() : 0;
      return bDate - aDate;
    });

  const inProgressTopic = inProgressTopics[0] || null;

  // Find next not-started topic
  const nextTopic = currentUnitTopics.find((t) => {
    const progress = topicProgressMap[t.id];
    return !progress || progress.mastery_level === 'not_started';
  });

  // Determine action type and topic
  let actionType: 'pain-point' | 'continue' | 'start' = 'start';
  let targetTopic = nextTopic || currentUnitTopics[0];
  let actionText = 'Start Learning';
  let subText = '';

  if (painPointTopic) {
    actionType = 'pain-point';
    targetTopic = painPointTopic;
    actionText = 'Review Weak Area';
    subText = 'Based on your assessment results';
  } else if (inProgressTopic) {
    actionType = 'continue';
    targetTopic = inProgressTopic;
    actionText = 'Continue Learning';
    const progress = topicProgressMap[inProgressTopic.id];
    subText = `${progress?.mastery_percentage || 0}% complete`;
  } else if (nextTopic) {
    actionText = 'Start Next Topic';
    const completedCount = currentUnitTopics.filter((t) => {
      const progress = topicProgressMap[t.id];
      return progress?.mastery_level === 'mastered';
    }).length;
    subText = `${completedCount}/${currentUnitTopics.length} topics completed`;
  }

  if (!targetTopic) {
    return null;
  }

  const currentUnitProgress = unitProgressList.find((u) => u.unit_number === currentUnit);
  const Icon = actionType === 'pain-point' ? BookOpen : actionType === 'continue' ? Play : Code2;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Your Next Step
            </p>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {targetTopic.name}
            </h3>
            <div className="flex items-center gap-2 mb-4">
              <span
                className="text-xs px-2 py-1 rounded-full font-medium"
                style={{
                  backgroundColor: `${currentUnitProgress?.color || '#E07856'}20`,
                  color: currentUnitProgress?.color || '#E07856',
                }}
              >
                Unit {currentUnit}
              </span>
              {actionType === 'pain-point' && (
                <span className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive font-medium">
                  Focus Area
                </span>
              )}
              {actionType === 'continue' && (
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  In Progress
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {subText || targetTopic.description}
            </p>
          </div>
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ml-4"
            style={{
              backgroundColor: `${currentUnitProgress?.color || '#E07856'}20`,
            }}
          >
            <Icon
              className="w-7 h-7"
              style={{ color: currentUnitProgress?.color || '#E07856' }}
            />
          </div>
        </div>
      </div>
      <Link
        href={`/course/topic/${targetTopic.id}`}
        className="flex items-center justify-between px-6 py-4 bg-foreground text-background hover:opacity-90 transition-opacity"
      >
        <span className="font-medium">{actionText}</span>
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  );
}
