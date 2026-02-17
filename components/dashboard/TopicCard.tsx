'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { Topic } from '@/types';

interface TopicCardProps {
  topic: Topic;
  mastery?: number;
  questionsAvailable?: number;
  onClick?: () => void;
}

export function TopicCard({
  topic,
  mastery = 0,
  questionsAvailable = 0,
  onClick,
}: TopicCardProps) {
  // Determine color based on mastery
  const getMasteryColor = (value: number) => {
    if (value < 30) return { bg: 'bg-error-light', ring: 'stroke-error', text: 'text-error' };
    if (value < 70) return { bg: 'bg-primary-100', ring: 'stroke-primary-500', text: 'text-primary-500' };
    return { bg: 'bg-success-light', ring: 'stroke-success', text: 'text-success' };
  };

  const colors = getMasteryColor(mastery);

  // SVG circle progress
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (mastery / 100) * circumference;

  return (
    <Card
      onClick={onClick}
      className={`border-cream-300 cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 ${colors.bg}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Topic Icon & Unit */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{topic.icon}</span>
              <span className="text-xs font-medium text-charcoal-light bg-white/50 px-2 py-0.5 rounded">
                Unit {topic.unitNumber}
              </span>
            </div>

            {/* Topic Name */}
            <h3 className="font-semibold text-charcoal mb-1">{topic.name}</h3>

            {/* Description */}
            <p className="text-sm text-charcoal-light line-clamp-2 mb-3">
              {topic.description}
            </p>

            {/* Questions Available */}
            <p className="text-xs text-charcoal-muted">
              {questionsAvailable} questions available
            </p>
          </div>

          {/* Circular Progress */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-16 h-16 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="32"
                cy="32"
                r={radius}
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-white/50"
              />
              {/* Progress circle */}
              <circle
                cx="32"
                cy="32"
                r={radius}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                className={colors.ring}
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                  transition: 'stroke-dashoffset 0.5s ease-in-out',
                }}
              />
            </svg>
            {/* Percentage text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm font-bold ${colors.text}`}>{mastery}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
