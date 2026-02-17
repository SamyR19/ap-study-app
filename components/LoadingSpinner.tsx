'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  color?: 'primary' | 'white' | 'charcoal';
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
  xl: 'w-12 h-12 border-4',
};

const colorClasses = {
  primary: 'border-primary-500 border-t-transparent',
  white: 'border-white border-t-transparent',
  charcoal: 'border-charcoal border-t-transparent',
};

export function LoadingSpinner({
  size = 'md',
  className,
  text,
  color = 'primary',
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'rounded-full animate-spin',
          sizeClasses[size],
          colorClasses[color]
        )}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="text-sm text-charcoal-light animate-pulse">{text}</p>
      )}
    </div>
  );
}

// Full page loading overlay
export function PageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="xl" />
        <p className="text-charcoal-light font-medium">{text}</p>
      </div>
    </div>
  );
}

// Inline loading for buttons and small areas
export function InlineLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <LoadingSpinner size="sm" />
      <span className="text-sm text-charcoal-light">Loading...</span>
    </div>
  );
}

// Content area loader with optional message
export function ContentLoader({
  text = 'Loading content...',
  className
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

// Dots loading animation (alternative style)
export function DotsLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-primary-500 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// Pulse loader (for cards and sections)
export function PulseLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-primary-500/20 animate-ping absolute inset-0" />
        <div className="w-10 h-10 rounded-full bg-primary-500/40" />
      </div>
    </div>
  );
}

// Progress bar loader
export function ProgressLoader({
  progress,
  className
}: {
  progress?: number;
  className?: string;
}) {
  return (
    <div className={cn('w-full', className)}>
      <div className="h-1 bg-cream-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: progress !== undefined ? `${progress}%` : undefined }}
        >
          {progress === undefined && (
            <div className="h-full w-1/3 bg-primary-500 animate-progress-indeterminate" />
          )}
        </div>
      </div>
    </div>
  );
}
