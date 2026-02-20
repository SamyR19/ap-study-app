'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  BookOpen,
  FileQuestion,
  Folder,
  Users,
  X,
} from 'lucide-react';
import { CreateMenuOption } from '@/types/study-tools';

interface CreateMenuPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder?: () => void;
  anchorPosition?: { top: number; left: number };
}

interface MenuItemConfig {
  id: CreateMenuOption;
  label: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  href?: string;
  onClick?: () => void;
}

export function CreateMenuPopup({
  isOpen,
  onClose,
  onCreateFolder,
  anchorPosition
}: CreateMenuPopupProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const menuItems: MenuItemConfig[] = [
    {
      id: 'flashcard_set',
      label: 'Flashcard set',
      description: 'Create study cards with terms and definitions',
      icon: Layers,
      iconBg: 'bg-blue-100 text-blue-600',
      href: '/create/flashcards',
    },
    {
      id: 'study_guide',
      label: 'Study guide',
      description: 'Generate organized study notes from text',
      icon: BookOpen,
      iconBg: 'bg-green-100 text-green-600',
      href: '/create/study-guide',
    },
    {
      id: 'practice_test',
      label: 'Practice test',
      description: 'Create quizzes from your study materials',
      icon: FileQuestion,
      iconBg: 'bg-purple-100 text-purple-600',
      href: '/create/practice-test',
    },
    {
      id: 'folder',
      label: 'Folder',
      description: 'Organize your study materials',
      icon: Folder,
      iconBg: 'bg-amber-100 text-amber-600',
      onClick: onCreateFolder,
    },
    {
      id: 'study_group',
      label: 'Study group',
      description: 'Collaborate with classmates',
      icon: Users,
      iconBg: 'bg-pink-100 text-pink-600',
      href: '/study-groups',
    },
  ];

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleItemClick = (item: MenuItemConfig) => {
    if (item.href) {
      router.push(item.href);
    } else if (item.onClick) {
      item.onClick();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/20 z-50"
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={anchorPosition ? {
              position: 'fixed',
              top: anchorPosition.top,
              left: anchorPosition.left,
            } : undefined}
            className={`${!anchorPosition ? 'fixed top-20 left-1/2 -translate-x-1/2' : ''} z-50 w-80 bg-white rounded-2xl shadow-xl border border-cream-200 overflow-hidden`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-cream-200">
              <h3 className="font-semibold text-charcoal">Create new</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-cream-100 transition-colors"
              >
                <X className="w-5 h-5 text-charcoal-light" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-cream-100 transition-colors text-left"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-charcoal">{item.label}</p>
                      <p className="text-sm text-charcoal-light truncate">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
