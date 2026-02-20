'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Code2,
  MessageSquare,
  BookOpen,
  FileText,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  darkBgColor: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'flashcards',
    label: 'Create Flashcards',
    description: 'AI-powered flashcard generation',
    href: '/create/flashcards?subject=ap-csa',
    icon: Sparkles,
    color: '#E07856',
    bgColor: '#FEF3E2',
    darkBgColor: 'rgba(224, 120, 86, 0.15)',
  },
  {
    id: 'code-practice',
    label: 'Code Practice',
    description: 'Practice coding with spaced repetition',
    href: '/course/code-practice',
    icon: Code2,
    color: '#6B9E78',
    bgColor: '#E8F5E9',
    darkBgColor: 'rgba(107, 158, 120, 0.15)',
  },
  {
    id: 'ai-tutor',
    label: 'AI Tutor',
    description: 'Get help with any AP CSA topic',
    href: '/ai-chat?context=ap-csa',
    icon: MessageSquare,
    color: '#2196F3',
    bgColor: '#E3F2FD',
    darkBgColor: 'rgba(33, 150, 243, 0.15)',
  },
  {
    id: 'study-guide',
    label: 'Study Guide',
    description: 'Generate comprehensive guides',
    href: '/create/study-guide?subject=ap-csa',
    icon: BookOpen,
    color: '#7B68EE',
    bgColor: '#EDE7F6',
    darkBgColor: 'rgba(123, 104, 238, 0.15)',
  },
  {
    id: 'practice-test',
    label: 'Practice Test',
    description: 'Create MCQ and FRQ tests',
    href: '/create/practice-test?subject=ap-csa',
    icon: ClipboardList,
    color: '#FF9800',
    bgColor: '#FFF3E0',
    darkBgColor: 'rgba(255, 152, 0, 0.15)',
  },
  {
    id: 'library',
    label: 'My Materials',
    description: 'View your study materials',
    href: '/library?subject=ap-csa',
    icon: FileText,
    color: '#607D8B',
    bgColor: '#ECEFF1',
    darkBgColor: 'rgba(96, 125, 139, 0.15)',
  },
];

interface QuickActionsProps {
  className?: string;
  compact?: boolean;
}

export function QuickActions({ className, compact = false }: QuickActionsProps) {
  if (compact) {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {quickActions.slice(0, 3).map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={action.href}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:shadow-md transition-all duration-200"
              >
                <Icon className="w-4 h-4" style={{ color: action.color }} />
                <span className="text-sm font-medium text-foreground">
                  {action.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3', className)}>
      {quickActions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href={action.href}>
              <div className="group p-4 rounded-xl border border-border bg-card hover:shadow-md hover:border-muted-foreground/40 transition-all duration-200 h-full">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: 'var(--quick-action-bg)' }}
                >
                  <style jsx>{`
                    div {
                      --quick-action-bg: ${action.bgColor};
                    }
                    :global(.dark) div {
                      --quick-action-bg: ${action.darkBgColor};
                    }
                  `}</style>
                  <Icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <h4 className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">
                  {action.label}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {action.description}
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
