'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface StreakCalendarProps {
  studyDays: Date[];
  className?: string;
}

function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function StreakCalendar({ studyDays, className }: StreakCalendarProps) {
  const studyDaySet = useMemo(() => {
    const set = new Set<string>();
    studyDays.forEach((day) => set.add(getDateKey(day)));
    return set;
  }, [studyDays]);

  // Generate last 12 weeks (84 days) of data
  const weeks = useMemo(() => {
    const today = new Date();
    const todayKeyValue = getDateKey(today);
    const result: { date: Date; hasActivity: boolean; isToday: boolean }[][] = [];
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 83); // Go back 12 weeks

    // Align to Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());

    let currentWeek: { date: Date; hasActivity: boolean; isToday: boolean }[] = [];

    for (let i = 0; i < 84; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isToday = getDateKey(date) === todayKeyValue;
      const hasActivity = studyDaySet.has(getDateKey(date));

      currentWeek.push({ date, hasActivity, isToday });

      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    }

    return result;
  }, [studyDaySet]);

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className={cn('', className)}>
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1">
          {dayLabels.map((label, idx) => (
            <div
              key={idx}
              className="w-3 h-3 text-[10px] text-charcoal-light flex items-center justify-center"
            >
              {idx % 2 === 1 ? label : ''}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1">
            {week.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className={cn(
                  'w-3 h-3 rounded-sm transition-colors',
                  day.hasActivity
                    ? 'bg-primary-500 hover:bg-primary-600'
                    : 'bg-cream-200 hover:bg-cream-300',
                  day.isToday && 'ring-1 ring-primary-500 ring-offset-1'
                )}
                title={`${day.date.toLocaleDateString()}${day.hasActivity ? ' - Studied!' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-charcoal-light">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-cream-200" />
          <span>No activity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary-500" />
          <span>Studied</span>
        </div>
      </div>
    </div>
  );
}
