'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Layers,
  BookOpen,
  FileQuestion,
  MoreVertical,
  Trash2,
  ChevronDown,
  Loader2,
  User,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FlashcardSet, StudyGuide, PracticeTest } from '@/types/study-tools';

type TabType = 'flashcards' | 'practice-tests' | 'study-guides';

interface LibraryItemWithType {
  item: FlashcardSet | StudyGuide | PracticeTest;
  type: TabType;
}

interface TimeGroup {
  label: string;
  items: LibraryItemWithType[];
}

export default function LibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab: TabType = (tabParam === 'flashcards' || tabParam === 'practice-tests' || tabParam === 'study-guides') ? tabParam : 'flashcards';

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  // Data states
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [studyGuides, setStudyGuides] = useState<StudyGuide[]>([]);
  const [practiceTests, setPracticeTests] = useState<PracticeTest[]>([]);

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'practice-tests', label: 'Practice tests', icon: FileQuestion },
    { id: 'study-guides', label: 'Study guides', icon: BookOpen },
  ];

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'User');

      // Load all data in parallel
      const [setsRes, guidesRes, testsRes] = await Promise.all([
        supabase
          .from('flashcard_sets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('study_guides')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('practice_tests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      setFlashcardSets(setsRes.data || []);
      setStudyGuides(guidesRes.data || []);
      setPracticeTests(testsRes.data || []);
    } catch (error) {
      console.error('Error loading library data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (type: TabType, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const table = type === 'flashcards' ? 'flashcard_sets'
        : type === 'study-guides' ? 'study_guides'
        : 'practice_tests';

      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;

      // Update local state
      if (type === 'flashcards') setFlashcardSets(prev => prev.filter(s => s.id !== id));
      else if (type === 'study-guides') setStudyGuides(prev => prev.filter(g => g.id !== id));
      else if (type === 'practice-tests') setPracticeTests(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
    setOpenMenuId(null);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    router.push(`/library?tab=${tab}`, { scroll: false });
  };

  const getCreatePath = () => {
    switch (activeTab) {
      case 'flashcards': return '/create/flashcards';
      case 'study-guides': return '/create/study-guide';
      case 'practice-tests': return '/create/practice-test';
      default: return '/create/flashcards';
    }
  };

  // Get items for current tab
  const getCurrentTabItems = (): LibraryItemWithType[] => {
    let items: LibraryItemWithType[] = [];

    switch (activeTab) {
      case 'flashcards':
        items = flashcardSets.map(item => ({ item, type: 'flashcards' as TabType }));
        break;
      case 'study-guides':
        items = studyGuides.map(item => ({ item, type: 'study-guides' as TabType }));
        break;
      case 'practice-tests':
        items = practiceTests.map(item => ({ item, type: 'practice-tests' as TabType }));
        break;
    }

    // Sort by created_at descending
    items.sort((a, b) => {
      const dateA = new Date(a.item.created_at).getTime();
      const dateB = new Date(b.item.created_at).getTime();
      return dateB - dateA;
    });

    return items;
  };

  // Group items by time
  const groupByTime = (items: LibraryItemWithType[]): TimeGroup[] => {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups: { [key: string]: LibraryItemWithType[] } = {
      'IN THE PAST HOUR': [],
      'TODAY': [],
      'YESTERDAY': [],
      'THIS WEEK': [],
      'OLDER': [],
    };

    items.forEach(({ item, type }) => {
      const createdAt = new Date(item.created_at);
      if (createdAt > hourAgo) {
        groups['IN THE PAST HOUR'].push({ item, type });
      } else if (createdAt > today) {
        groups['TODAY'].push({ item, type });
      } else if (createdAt > yesterday) {
        groups['YESTERDAY'].push({ item, type });
      } else if (createdAt > weekAgo) {
        groups['THIS WEEK'].push({ item, type });
      } else {
        groups['OLDER'].push({ item, type });
      }
    });

    return Object.entries(groups)
      .filter(([, items]) => items.length > 0)
      .map(([label, items]) => ({ label, items }));
  };

  // Filter items by search
  const filterItemsBySearch = (items: LibraryItemWithType[]): LibraryItemWithType[] => {
    if (!searchQuery.trim()) return items;

    return items.filter(({ item }) => {
      const title = (item as FlashcardSet).title || '';
      return title.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  const currentTabItems = getCurrentTabItems();
  const filteredItems = filterItemsBySearch(currentTabItems);
  const groupedItems = groupByTime(filteredItems);

  const renderItem = (item: FlashcardSet | StudyGuide | PracticeTest, type: TabType) => {
    const title = (item as FlashcardSet).title || '';
    const id = item.id;

    const getItemDetails = () => {
      switch (type) {
        case 'flashcards':
          return `${(item as FlashcardSet).card_count || 0} Terms`;
        case 'study-guides':
          return `${(item as StudyGuide).outline_content?.sections?.length || 0} Sections`;
        case 'practice-tests':
          return `${(item as PracticeTest).questions?.length || 0} Questions`;
      }
    };

    const getItemPath = () => {
      switch (type) {
        case 'flashcards': return `/library/study-sets/${id}`;
        case 'study-guides': return `/library/study-guides/${id}`;
        case 'practice-tests': return `/library/practice-tests/${id}`;
      }
    };

    const getIcon = () => {
      switch (type) {
        case 'flashcards': return Layers;
        case 'study-guides': return BookOpen;
        case 'practice-tests': return FileQuestion;
      }
    };

    const getIconBg = () => {
      switch (type) {
        case 'flashcards': return 'bg-blue-100 text-blue-600';
        case 'study-guides': return 'bg-green-100 text-green-600';
        case 'practice-tests': return 'bg-purple-100 text-purple-600';
      }
    };

    const Icon = getIcon();

    return (
      <motion.div
        key={id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-cream-200 p-4 hover:shadow-md transition-all cursor-pointer group relative"
        onClick={() => router.push(getItemPath())}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-xl ${getIconBg()} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm text-charcoal-light mb-1">
                <span className="font-medium">{getItemDetails()}</span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {userName}
                </span>
              </div>
              <h3 className="font-semibold text-charcoal truncate">{title}</h3>
            </div>
          </div>

          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === id ? null : id);
              }}
              className="p-1 rounded-lg hover:bg-cream-100 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-5 h-5 text-charcoal-light" />
            </button>

            {openMenuId === id && (
              <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-lg border border-cream-200 py-1 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(type, id);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const getCreateButtonText = () => {
    switch (activeTab) {
      case 'flashcards': return 'Create Set';
      case 'study-guides': return 'Create Guide';
      case 'practice-tests': return 'Create Test';
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-charcoal">Your library</h1>
        <button
          onClick={() => router.push(getCreatePath())}
          className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {getCreateButtonText()}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-cream-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-charcoal'
                : 'text-charcoal-light hover:text-charcoal'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeLibraryTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
              />
            )}
          </button>
        ))}
      </div>

      {/* Filters Row */}
      <div className="flex items-center justify-between mb-6">
        <button className="flex items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-cream-100 rounded-lg transition-colors">
          Recent
          <ChevronDown className="w-4 h-4" />
        </button>

        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-light" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab.replace('-', ' ')}...`}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-charcoal-light"
          />
        </div>
      </div>

      {/* Content */}
      {groupedItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-cream-100 rounded-2xl flex items-center justify-center">
            {activeTab === 'flashcards' && <Layers className="w-8 h-8 text-charcoal-light" />}
            {activeTab === 'study-guides' && <BookOpen className="w-8 h-8 text-charcoal-light" />}
            {activeTab === 'practice-tests' && <FileQuestion className="w-8 h-8 text-charcoal-light" />}
          </div>
          <h3 className="text-lg font-semibold text-charcoal mb-2">
            No {activeTab.replace('-', ' ')} yet
          </h3>
          <p className="text-charcoal-light mb-6">
            {searchQuery ? `No results for "${searchQuery}"` : `Create your first ${activeTab === 'flashcards' ? 'flashcard set' : activeTab === 'study-guides' ? 'study guide' : 'practice test'} to get started`}
          </p>
          {!searchQuery && (
            <button
              onClick={() => router.push(getCreatePath())}
              className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {getCreateButtonText()}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {groupedItems.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-xs font-semibold text-charcoal-light uppercase tracking-wide">
                  {group.label}
                </h2>
                <div className="flex-1 h-px bg-cream-200" />
              </div>
              <div className="space-y-3">
                {group.items.map(({ item, type }) => renderItem(item, type))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
