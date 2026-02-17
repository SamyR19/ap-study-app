'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon, BookOpen, Trophy, FileText, Lock, Search, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode | LucideIcon | string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
  };
  className?: string;
}

// Main EmptyState component
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const renderIcon = (): ReactNode => {
    if (typeof icon === 'string') {
      // Emoji
      return <span className="text-5xl">{icon}</span>;
    }
    if (icon) {
      // Lucide icon or React node
      const IconComponent = icon as LucideIcon;
      if (typeof IconComponent === 'function') {
        return <IconComponent className="w-12 h-12 text-charcoal-light" />;
      }
      return icon as ReactNode;
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className
      )}
    >
      {icon && (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-4"
        >
          {renderIcon()}
        </motion.div>
      )}

      <h3 className="text-xl font-bold text-charcoal mb-2">{title}</h3>

      <p className="text-charcoal-light max-w-sm leading-relaxed mb-6">
        {description}
      </p>

      {action && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Button
            onClick={action.onClick}
            variant={action.variant || 'default'}
            className={cn(
              'rounded-xl px-6',
              action.variant !== 'outline' && 'bg-primary-500 hover:bg-primary-600 text-white'
            )}
          >
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Pre-configured empty states

export function NoPracticeHistory({ onStart }: { onStart: () => void }) {
  return (
    <EmptyState
      icon={BookOpen}
      title="Start Your Journey"
      description="Begin practicing to track your progress and master AP concepts."
      action={{
        label: 'Choose a Topic',
        onClick: onStart,
      }}
    />
  );
}

export function NoWeakAreas() {
  return (
    <EmptyState
      icon={Trophy}
      title="Great Work!"
      description="You're doing well across all topics. Keep up the excellent practice!"
    />
  );
}

export function NoRecentActivity({ onStart }: { onStart: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No Recent Activity"
      description="Practice questions to see your history and track your learning journey."
      action={{
        label: 'Start Practicing',
        onClick: onStart,
      }}
    />
  );
}

export function SubjectNotAvailable() {
  return (
    <EmptyState
      icon={Lock}
      title="Coming Soon"
      description="This subject is not yet available. We're working hard to add more content. Check back later!"
    />
  );
}

export function NoSearchResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <EmptyState
      icon={Search}
      title="No Results Found"
      description={`We couldn't find anything matching "${query}". Try adjusting your search.`}
      action={{
        label: 'Clear Search',
        onClick: onClear,
        variant: 'outline',
      }}
    />
  );
}

export function EmptyInbox() {
  return (
    <EmptyState
      icon={Inbox}
      title="All Caught Up"
      description="You have no notifications at this time."
    />
  );
}

export function NoQuestionsAvailable({ onRefresh }: { onRefresh: () => void }) {
  return (
    <EmptyState
      icon="📝"
      title="No Questions Available"
      description="There are no questions for this topic yet. Try another topic or check back later."
      action={{
        label: 'Browse Topics',
        onClick: onRefresh,
      }}
    />
  );
}

export function PremiumRequired({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <EmptyState
      icon="⭐"
      title="Premium Feature"
      description="Upgrade to Premium to unlock unlimited practice, detailed analytics, and AI-powered feedback."
      action={{
        label: 'Upgrade Now',
        onClick: onUpgrade,
      }}
    />
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon="😕"
      title="Something Went Wrong"
      description="We encountered an error loading this content. Please try again."
      action={{
        label: 'Try Again',
        onClick: onRetry,
        variant: 'outline',
      }}
    />
  );
}
