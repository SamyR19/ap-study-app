'use client';

import { cn } from '@/lib/utils';
import { FileText, Code, CheckCircle, XCircle } from 'lucide-react';

interface Activity {
  id: string;
  type: 'mcq' | 'frq';
  topicName: string;
  score: number;
  maxScore: number;
  timestamp: Date;
  isCorrect?: boolean;
}

interface ActivityFeedProps {
  activities: Activity[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function ActivityFeed({
  activities,
  onLoadMore,
  hasMore = false,
  className,
}: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-charcoal-light" />
        </div>
        <h3 className="font-semibold text-charcoal mb-1">No activity yet</h3>
        <p className="text-sm text-charcoal-light">
          Start practicing to see your activity here
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-0">
        {activities.map((activity, index) => {
          const isLast = index === activities.length - 1;
          const percentage = Math.round((activity.score / activity.maxScore) * 100);

          return (
            <div key={activity.id} className="flex gap-4">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                    activity.type === 'mcq' ? 'bg-blue-100' : 'bg-purple-100'
                  )}
                >
                  {activity.type === 'mcq' ? (
                    <FileText
                      className={cn(
                        'w-5 h-5',
                        activity.type === 'mcq' ? 'text-blue-600' : 'text-purple-600'
                      )}
                    />
                  ) : (
                    <Code className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                {!isLast && <div className="w-0.5 flex-1 bg-cream-300 my-2" />}
              </div>

              {/* Content */}
              <div className={cn('flex-1 pb-6', isLast && 'pb-0')}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-charcoal">{activity.topicName}</p>
                    <p className="text-sm text-charcoal-light">
                      {activity.type === 'mcq' ? 'Multiple Choice' : 'Free Response'}
                    </p>
                  </div>
                  <span className="text-xs text-charcoal-light">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>

                {/* Score Badge */}
                <div className="mt-2 flex items-center gap-2">
                  <div
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium',
                      percentage >= 70
                        ? 'bg-success-light text-success-dark'
                        : percentage >= 50
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    )}
                  >
                    {percentage >= 70 ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    {activity.score}/{activity.maxScore} ({percentage}%)
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && onLoadMore && (
        <button
          onClick={onLoadMore}
          className="w-full mt-4 py-2.5 text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
        >
          Load more activity
        </button>
      )}
    </div>
  );
}
