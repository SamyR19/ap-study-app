'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}

function getGradientColor(value: number): string {
  if (value < 30) return 'from-red-400 to-red-500';
  if (value < 70) return 'from-amber-400 to-orange-500';
  if (value < 90) return 'from-lime-400 to-green-500';
  return 'from-green-400 to-emerald-500';
}

const sizeConfig = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  label,
  showPercentage = true,
  size = 'md',
  className,
  animate = true,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const gradient = getGradientColor(clampedValue);

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-charcoal-light">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-charcoal">{Math.round(clampedValue)}%</span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-cream-200 rounded-full overflow-hidden', sizeConfig[size])}>
        <motion.div
          initial={animate ? { width: 0 } : { width: `${clampedValue}%` }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full bg-gradient-to-r', gradient)}
        />
      </div>
    </div>
  );
}
