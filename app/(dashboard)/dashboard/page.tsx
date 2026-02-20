'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import {
  Search,
  X,
  Globe,
  FolderOpen,
  MessageCircle,
  FileText,
  BookOpen,
  Sparkles,
  ClipboardList,
  BookMarked,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Target,
  Flame,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseKey);
};

// Search filter options
const searchFilters = [
  { id: 'all', label: 'All', icon: Globe },
  { id: 'materials', label: 'My Materials', icon: FolderOpen },
  { id: 'chats', label: 'My Chats', icon: MessageCircle },
  { id: 'exams', label: 'Exams', icon: FileText },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
];

// Create options
const createOptions = [
  {
    id: 'flashcards',
    title: 'Flashcards with AI',
    description: 'Generate smart flashcards instantly.',
    icon: Sparkles,
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-500',
    href: '/create/flashcards',
  },
  {
    id: 'practice',
    title: 'Practice Tests',
    description: 'Create custom practice exams.',
    icon: ClipboardList,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    href: '/create/practice-test',
  },
  {
    id: 'guides',
    title: 'Study Guides',
    description: 'Build comprehensive study guides.',
    icon: BookMarked,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    href: '/create/study-guide',
  },
];

interface UserStreak {
  current_streak: number;
  longest_streak: number;
  total_study_days: number;
  last_study_date: string | null;
}

interface RecentItem {
  id: string;
  title: string;
  type: string;
  progress: number;
  viewedAt: string;
}

interface DayData {
  day: string;
  hours: number;
  questions: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [chatInput, setChatInput] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Real data state
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [studyData, setStudyData] = useState<DayData[]>([]);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [weeklyChange, setWeeklyChange] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const supabase = getSupabase();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/login');
        return;
      }


      // Fetch streak data
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (streakData) {
        setStreak({
          current_streak: streakData.current_streak || 0,
          longest_streak: streakData.longest_streak || 0,
          total_study_days: streakData.total_study_days || 0,
          last_study_date: streakData.last_study_date,
        });
      } else {
        setStreak({
          current_streak: 0,
          longest_streak: 0,
          total_study_days: 0,
          last_study_date: null,
        });
      }

      // Fetch study sessions for the past week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: sessionsData } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', authUser.id)
        .gte('started_at', oneWeekAgo.toISOString())
        .order('started_at', { ascending: true });

      // Process sessions into daily data
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date();
      const weekData: DayData[] = [];
      let weekHours = 0;
      let weekQuestions = 0;

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayName = days[date.getDay()];

        const daySessions = sessionsData?.filter(s => {
          const sessionDate = new Date(s.started_at);
          return sessionDate.toDateString() === date.toDateString();
        }) || [];

        const dayHours = daySessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) / 60;
        const dayQuestions = daySessions.reduce((acc, s) => acc + (s.questions_attempted || 0), 0);

        weekData.push({
          day: dayName,
          hours: Math.round(dayHours * 10) / 10,
          questions: dayQuestions,
        });

        weekHours += dayHours;
        weekQuestions += dayQuestions;
      }

      setStudyData(weekData);
      setTotalHours(Math.round(weekHours * 10) / 10);
      setTotalQuestions(weekQuestions);

      // Calculate weekly change (compare to previous week)
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const { data: prevWeekSessions } = await supabase
        .from('study_sessions')
        .select('duration_minutes')
        .eq('user_id', authUser.id)
        .gte('started_at', twoWeeksAgo.toISOString())
        .lt('started_at', oneWeekAgo.toISOString());

      const prevWeekHours = (prevWeekSessions?.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) || 0) / 60;

      if (prevWeekHours > 0) {
        const change = ((weekHours - prevWeekHours) / prevWeekHours) * 100;
        setWeeklyChange(Math.round(change * 10) / 10);
      } else if (weekHours > 0) {
        setWeeklyChange(100);
      } else {
        setWeeklyChange(0);
      }

      // Fetch recent items from all types
      const [flashcardSetsRes, studyGuidesRes, practiceTestsRes] = await Promise.all([
        supabase
          .from('flashcard_sets')
          .select('id, title, card_count, updated_at')
          .eq('user_id', authUser.id)
          .order('updated_at', { ascending: false })
          .limit(4),
        supabase
          .from('study_guides')
          .select('id, title, updated_at')
          .eq('user_id', authUser.id)
          .order('updated_at', { ascending: false })
          .limit(4),
        supabase
          .from('practice_tests')
          .select('id, title, updated_at')
          .eq('user_id', authUser.id)
          .order('updated_at', { ascending: false })
          .limit(4),
      ]);

      const allItems: RecentItem[] = [];

      // Add flashcard sets
      flashcardSetsRes.data?.forEach(set => {
        const updatedAt = new Date(set.updated_at);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
        let viewedAt = 'today';
        if (diffDays === 1) viewedAt = 'yesterday';
        else if (diffDays > 1) viewedAt = `${diffDays} days ago`;

        allItems.push({
          id: set.id,
          title: set.title,
          type: 'flashcards',
          progress: 0,
          viewedAt,
        });
      });

      // Add study guides
      studyGuidesRes.data?.forEach(guide => {
        const updatedAt = new Date(guide.updated_at);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
        let viewedAt = 'today';
        if (diffDays === 1) viewedAt = 'yesterday';
        else if (diffDays > 1) viewedAt = `${diffDays} days ago`;

        allItems.push({
          id: guide.id,
          title: guide.title,
          type: 'study-guides',
          progress: 0,
          viewedAt,
        });
      });

      // Add practice tests
      practiceTestsRes.data?.forEach(test => {
        const updatedAt = new Date(test.updated_at);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
        let viewedAt = 'today';
        if (diffDays === 1) viewedAt = 'yesterday';
        else if (diffDays > 1) viewedAt = `${diffDays} days ago`;

        allItems.push({
          id: test.id,
          title: test.title,
          type: 'practice-tests',
          progress: 0,
          viewedAt,
        });
      });

      // Sort by viewedAt and take the most recent
      allItems.sort((a, b) => {
        const getOrder = (v: string) => {
          if (v === 'today') return 0;
          if (v === 'yesterday') return 1;
          return parseInt(v) || 999;
        };
        return getOrder(a.viewedAt) - getOrder(b.viewedAt);
      });

      setRecentItems(allItems.slice(0, 6));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSlides = Math.ceil(recentItems.length / 2);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground-light" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Recents Section */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Recents</h2>

          {recentItems.length === 0 ? (
            <div className="bg-muted rounded-2xl p-8 text-center">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-foreground-light" />
              </div>
              <p className="text-foreground-light">No recent activity yet</p>
              <p className="text-sm text-foreground-light/70 mt-1">Start studying to see your progress here</p>
            </div>
          ) : (
            <div className="relative">
              {/* Carousel Container */}
              <div className="overflow-hidden">
                <motion.div
                  className="flex gap-4"
                  animate={{ x: `-${currentSlide * 50}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  {recentItems.map((item) => {
                    const getItemPath = () => {
                      switch (item.type) {
                        case 'flashcards': return `/library/study-sets/${item.id}`;
                        case 'study-guides': return `/library/study-guides/${item.id}`;
                        case 'practice-tests': return `/library/practice-tests/${item.id}`;
                        default: return `/library/study-sets/${item.id}`;
                      }
                    };
                    const getPracticePath = () => {
                      if (item.type === 'flashcards') return `/library/study-sets/${item.id}?practice=true`;
                      return getItemPath();
                    };
                    return (
                      <div
                        key={`${item.type}-${item.id}`}
                        onClick={() => router.push(getItemPath())}
                        className="flex-shrink-0 w-[calc(50%-8px)] bg-card rounded-3xl p-6 border border-border hover:border-muted-foreground/30 transition-colors cursor-pointer shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-4">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <span className="text-xs font-medium text-foreground-light uppercase tracking-wide">
                                  {item.type === 'flashcards' ? 'Flashcard Set' : item.type === 'study-guides' ? 'Study Guide' : 'Practice Test'}
                                </span>
                                <h3 className="font-semibold text-foreground text-lg leading-tight pr-2">{item.title}</h3>
                              </div>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="text-foreground-light hover:text-foreground transition-colors flex-shrink-0"
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-2">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full transition-all duration-300"
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                            </div>
                            <p className="text-sm text-foreground-light mb-6">{item.progress}% completed</p>

                            {/* Continue Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(getPracticePath());
                              }}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-full transition-colors"
                            >
                              Continue
                            </button>
                          </div>

                          {/* Illustration */}
                          <div className="w-40 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <div className="w-16 h-10 bg-card rounded-lg border border-blue-100 flex items-center justify-center">
                                  <div className="w-8 h-1 bg-blue-200 rounded" />
                                </div>
                                <div className="w-8 h-10 bg-card rounded-lg border border-blue-100 flex items-center justify-center">
                                  <div className="w-4 h-4 rounded-full border-2 border-indigo-300" />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <div className="w-12 h-8 bg-card rounded-lg border border-blue-100 flex items-center justify-center">
                                  <BookOpen className="w-4 h-4 text-indigo-300" />
                                </div>
                                <div className="w-12 h-8 bg-card rounded-lg border border-blue-100" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </div>

              {/* Navigation Arrow */}
              {totalSlides > 1 && currentSlide < totalSlides - 1 && (
                <button
                  onClick={() => setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1))}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-card rounded-full shadow-lg flex items-center justify-center hover:bg-muted transition-colors border border-border"
                >
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
              )}
              {currentSlide > 0 && (
                <button
                  onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-card rounded-full shadow-lg flex items-center justify-center hover:bg-muted transition-colors border border-border"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
              )}

              {/* Dots Indicator */}
              {totalSlides > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {Array.from({ length: totalSlides }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-colors',
                        currentSlide === idx ? 'bg-indigo-500' : 'bg-muted-foreground/30'
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Create Section */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Create</h2>
          <div className="flex gap-3">
            {createOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => router.push(option.href)}
                className="bg-card rounded-2xl p-4 border border-border hover:border-muted-foreground/30 transition-colors cursor-pointer shadow-sm group w-56"
              >
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', option.iconBg)}>
                  <option.icon className={cn('w-5 h-5', option.iconColor)} />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">
                  {option.title}
                </h3>
                <p className="text-xs text-foreground-light">{option.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Analytics Section */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Your Analytics</h2>
          <div className="flex gap-4">
            {/* Main Chart Area */}
            <div className="flex-1 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              {/* Tabs */}
              <div className="flex gap-6 px-6 pt-4 border-b border-border">
                <button className="pb-3 text-foreground font-medium border-b-2 border-foreground">Overview</button>
                <button className="pb-3 text-foreground-light hover:text-foreground transition-colors">Weekly</button>
                <button className="pb-3 text-foreground-light hover:text-foreground transition-colors">Monthly</button>
              </div>

              <div className="p-6">
                {/* Stats Header */}
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-bold text-foreground">{totalHours}</span>
                  <span className="text-lg text-foreground-light">hours</span>
                  {weeklyChange !== 0 && (
                    <span className={`flex items-center gap-1 text-sm font-medium ${weeklyChange > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      <TrendingUp className={`w-4 h-4 ${weeklyChange < 0 ? 'rotate-180' : ''}`} />
                      {weeklyChange > 0 ? '+' : ''}{weeklyChange}%
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground-light mb-4">Total study time this week</p>

                {/* Time Period Selectors */}
                <div className="flex items-center gap-2 mb-6">
                  <button className="px-3 py-1.5 text-xs font-medium bg-foreground text-white rounded-lg">1W</button>
                  <button className="px-3 py-1.5 text-xs font-medium text-foreground-light hover:bg-muted rounded-lg transition-colors">1M</button>
                  <button className="px-3 py-1.5 text-xs font-medium text-foreground-light hover:bg-muted rounded-lg transition-colors">3M</button>
                  <button className="px-3 py-1.5 text-xs font-medium text-foreground-light hover:bg-muted rounded-lg transition-colors">6M</button>
                  <button className="px-3 py-1.5 text-xs font-medium text-foreground-light hover:bg-muted rounded-lg transition-colors">1Y</button>
                  <button className="px-3 py-1.5 text-xs font-medium text-foreground-light hover:bg-muted rounded-lg transition-colors">ALL</button>
                </div>

                {/* Chart */}
                <div className="h-56">
                  {studyData.some(d => d.hours > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={studyData}>
                        <defs>
                          <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DD" vertical={false} />
                        <XAxis dataKey="day" stroke="#6B6B6B" fontSize={12} axisLine={false} tickLine={false} />
                        <YAxis stroke="#6B6B6B" fontSize={12} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #E8E4DD',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="hours"
                          stroke="#22C55E"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorHours)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-foreground-light">
                      <Clock className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p>No study data yet</p>
                      <p className="text-sm text-foreground-light/70">Start a study session to see your progress</p>
                    </div>
                  )}
                </div>

                {/* Bottom Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-sm text-foreground-light">This Week</p>
                    <p className="font-semibold text-foreground">{totalHours}h</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-light">Avg Daily</p>
                    <p className="font-semibold text-foreground">{(totalHours / 7).toFixed(1)}h</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-light">Questions</p>
                    <p className="font-semibold text-foreground">{totalQuestions}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-72 bg-card rounded-2xl border border-border shadow-sm">
              {/* Header */}
              <div className="px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground">Performance</h3>
              </div>

              {/* Stats List */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Flame className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{streak?.current_streak || 0} Day Streak</p>
                    <p className="text-xs text-foreground-light">
                      {streak && streak.current_streak > 0 ? 'Keep it going!' : 'Start your streak today!'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{totalQuestions} Questions</p>
                    <p className="text-xs text-foreground-light">Answered this week</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{totalHours} Hours</p>
                    <p className="text-xs text-foreground-light">Total study time</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="px-4 pb-3">
                <div className="flex border-b border-border">
                  <button className="flex-1 pb-2 text-sm font-medium text-foreground border-b-2 border-foreground">Stats</button>
                  <button className="flex-1 pb-2 text-sm text-foreground-light hover:text-foreground transition-colors">Goals</button>
                </div>
              </div>

              {/* Stats */}
              <div className="px-4 pb-4 space-y-2">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-foreground">Longest Streak</span>
                  <span className="text-sm font-medium text-foreground">{streak?.longest_streak || 0} days</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-foreground">Total Study Days</span>
                  <span className="text-sm font-medium text-foreground">{streak?.total_study_days || 0}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-foreground">Avg Session</span>
                  <span className="text-sm font-medium text-foreground">
                    {totalHours > 0 ? `${(totalHours / Math.max(streak?.total_study_days || 1, 1)).toFixed(1)}h` : '0h'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ask Anything Input */}
        <section>
          <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center hover:bg-muted transition-colors">
                <Plus className="w-5 h-5 text-foreground-light" />
              </button>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask anything about studying..."
                className="flex-1 bg-transparent text-foreground placeholder:text-foreground-light outline-none"
              />
              <button className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center hover:bg-primary-600 transition-colors">
                <ArrowRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="absolute inset-0 bg-black/20"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl mx-4 bg-card rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex h-[500px]">
                {/* Left Sidebar */}
                <div className="w-56 border-r border-border p-4">
                  <nav className="space-y-1">
                    {searchFilters.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={cn(
                          'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-colors',
                          activeFilter === filter.id
                            ? 'bg-muted text-foreground font-medium'
                            : 'text-foreground-light hover:text-foreground hover:bg-muted'
                        )}
                      >
                        <filter.icon className="w-4 h-4" />
                        {filter.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Right Content */}
                <div className="flex-1 flex flex-col">
                  {/* Search Input */}
                  <div className="flex items-center gap-3 p-4 border-b border-border">
                    <Search className="w-5 h-5 text-foreground-light" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for anything..."
                      autoFocus
                      className="flex-1 bg-transparent text-foreground placeholder:text-foreground-light outline-none text-lg"
                    />
                    <button
                      onClick={() => setIsSearchOpen(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                    >
                      <X className="w-5 h-5 text-foreground-light" />
                    </button>
                  </div>

                  {/* Recently Viewed */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground">Recently viewed</h3>
                      {recentItems.length > 0 && (
                        <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                          Clear
                        </button>
                      )}
                    </div>

                    {recentItems.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-foreground-light">No recent items</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {recentItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted cursor-pointer transition-colors"
                          >
                            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-foreground-light" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{item.title}</p>
                              <p className="text-sm text-foreground-light">Viewed {item.viewedAt}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
