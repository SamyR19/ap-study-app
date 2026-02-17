'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

// Base skeleton with shimmer animation
function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-cream-200',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:animate-shimmer before:bg-gradient-to-r',
        'before:from-transparent before:via-white/60 before:to-transparent',
        className
      )}
      style={style}
    />
  );
}

// Card skeleton - for topic cards, stat cards
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-white rounded-2xl border border-cream-300 p-6', className)}>
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
    </div>
  );
}

// Stat card skeleton - for dashboard stats
export function StatCardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-white rounded-2xl border border-cream-300 p-5', className)}>
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

// List skeleton - for activity feed, topic lists
export function ListSkeleton({
  items = 5,
  className
}: SkeletonProps & { items?: number }) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-cream-300">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// Chart skeleton - for progress charts
export function ChartSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-white rounded-2xl border border-cream-300 p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
      <div className="relative h-[200px]">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between py-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-6" />
          ))}
        </div>
        {/* Chart area */}
        <div className="ml-10 h-full flex items-end justify-between gap-2 pb-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t-lg"
              style={{ height: `${30 + Math.random() * 60}%` }}
            />
          ))}
        </div>
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-10 right-0 flex justify-between">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-8" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Editor skeleton - for code editor loading
export function EditorSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-[#1E1E1E] rounded-xl overflow-hidden', className)}>
      {/* Editor toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded bg-gray-700" />
          <Skeleton className="h-6 w-20 rounded bg-gray-700" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-lg bg-gray-700" />
          <Skeleton className="h-8 w-8 rounded-lg bg-gray-700" />
        </div>
      </div>
      {/* Line numbers and code */}
      <div className="p-4 space-y-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="w-6 h-4 rounded bg-gray-700 flex-shrink-0" />
            <Skeleton
              className="h-4 rounded bg-gray-700"
              style={{ width: `${20 + Math.random() * 60}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Topic grid skeleton
export function TopicGridSkeleton({
  items = 6,
  className
}: SkeletonProps & { items?: number }) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// Dashboard skeleton - full page loading
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      {/* Activity section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ListSkeleton items={4} />
        </div>
        <CardSkeleton />
      </div>
    </div>
  );
}

// Progress page skeleton
export function ProgressSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      {/* Calendar and chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-cream-300 p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
        </div>
        <ChartSkeleton />
      </div>
      {/* Topic mastery */}
      <div className="bg-white rounded-2xl border border-cream-300 p-6">
        <Skeleton className="h-5 w-40 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="flex-1 h-3 rounded-full" />
              <Skeleton className="w-12 h-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { Skeleton };
