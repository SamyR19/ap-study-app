'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Settings,
  Zap,
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
import { SettingsDropdown } from '@/components/dashboard/SettingsDropdown';

// Mock data for analytics chart
const studyData = [
  { day: 'Mon', hours: 2.5, questions: 45 },
  { day: 'Tue', hours: 3.2, questions: 62 },
  { day: 'Wed', hours: 1.8, questions: 38 },
  { day: 'Thu', hours: 4.1, questions: 85 },
  { day: 'Fri', hours: 3.5, questions: 71 },
  { day: 'Sat', hours: 2.0, questions: 42 },
  { day: 'Sun', hours: 3.8, questions: 78 },
];

// Mock recent items with progress
const recentItems = [
  { id: 1, title: 'AP Computer Science Semester 1 Finals MCQ Study Guide', type: 'guide', progress: 1, viewedAt: '2 days ago' },
  { id: 2, title: 'AP Human Geography Unit 4 Review', type: 'flashcards', progress: 4, viewedAt: '3 days ago' },
  { id: 3, title: 'AP US History Study Guide', type: 'guide', progress: 15, viewedAt: '5 days ago' },
  { id: 4, title: 'AP Biology Cell Structure Quiz', type: 'test', progress: 32, viewedAt: '1 week ago' },
];

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
  },
  {
    id: 'practice',
    title: 'Practice Tests',
    description: 'Create custom practice exams.',
    icon: ClipboardList,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 'guides',
    title: 'Study Guides',
    description: 'Build comprehensive study guides.',
    icon: BookMarked,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
];

export default function DashboardPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [chatInput, setChatInput] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Mock user data
  const user = {
    name: 'Samy Rabah',
    email: 'samyrabahfc@gmail.com',
    avatar_url: '',
  };

  const totalSlides = Math.ceil(recentItems.length / 2);

  return (
    <div className="min-h-screen p-6">
      {/* Top Header */}
      <div className="flex items-center gap-3 mb-6">
        {/* Search Bar */}
        <div
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-cream-200 cursor-pointer hover:border-charcoal-light/30 transition-colors shadow-sm flex-1 max-w-xl"
        >
          <Search className="w-4 h-4 text-charcoal-light" />
          <span className="text-sm text-charcoal-light">Search for anything...</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Upgrade Button */}
        <button className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-full transition-colors">
          <Zap className="w-3.5 h-3.5" />
          <span>Upgrade: free 7-day trial</span>
        </button>

        {/* Streak Counter */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-cream-200 rounded-full">
          <Flame className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-semibold text-charcoal">7</span>
        </div>

        {/* Settings Button */}
        <div className="relative">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="w-8 h-8 flex items-center justify-center bg-white border border-cream-200 rounded-full hover:bg-cream-50 transition-colors"
          >
            <Settings className="w-4 h-4 text-charcoal-light" />
          </button>
          <SettingsDropdown
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            user={user}
          />
        </div>
      </div>

      <div className="max-w-4xl space-y-8">

        {/* Recents Section */}
        <section>
          <h2 className="text-xl font-semibold text-charcoal mb-4">Recents</h2>
          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden">
              <motion.div
                className="flex gap-4"
                animate={{ x: `-${currentSlide * 50}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {recentItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex-shrink-0 w-[calc(50%-8px)] bg-white rounded-3xl p-6 border border-cream-200 hover:border-charcoal-light/30 transition-colors cursor-pointer shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-4">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="font-semibold text-charcoal text-lg leading-tight pr-2">{item.title}</h3>
                          <button className="text-charcoal-light hover:text-charcoal transition-colors flex-shrink-0">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-2">
                          <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full transition-all duration-300"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                        <p className="text-sm text-charcoal-light mb-6">{item.progress}% of questions completed</p>

                        {/* Continue Button */}
                        <button className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-full transition-colors">
                          Continue
                        </button>
                      </div>

                      {/* Illustration */}
                      <div className="w-40 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <div className="w-16 h-10 bg-white rounded-lg border border-blue-100 flex items-center justify-center">
                              <div className="w-8 h-1 bg-blue-200 rounded" />
                            </div>
                            <div className="w-8 h-10 bg-white rounded-lg border border-blue-100 flex items-center justify-center">
                              <div className="w-4 h-4 rounded-full border-2 border-indigo-300" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="w-12 h-8 bg-white rounded-lg border border-blue-100 flex items-center justify-center">
                              <div className="w-6 h-6 text-indigo-300">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <path d="M9 19V6l12-3v13M9 19c0 1.1-1.35 2-3 2s-3-.9-3-2 1.35-2 3-2 3 .9 3 2zM21 16c0 1.1-1.35 2-3 2s-3-.9-3-2 1.35-2 3-2 3 .9 3 2z"/>
                                </svg>
                              </div>
                            </div>
                            <div className="w-12 h-8 bg-white rounded-lg border border-blue-100" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Navigation Arrow */}
            {currentSlide < totalSlides - 1 && (
              <button
                onClick={() => setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1))}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-cream-50 transition-colors border border-cream-200"
              >
                <ChevronRight className="w-5 h-5 text-charcoal" />
              </button>
            )}
            {currentSlide > 0 && (
              <button
                onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-cream-50 transition-colors border border-cream-200"
              >
                <ChevronLeft className="w-5 h-5 text-charcoal" />
              </button>
            )}

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    currentSlide === idx ? 'bg-indigo-500' : 'bg-cream-300'
                  )}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Create Section */}
        <section>
          <h2 className="text-xl font-semibold text-charcoal mb-4">Create</h2>
          <div className="flex gap-3">
            {createOptions.map((option) => (
              <div
                key={option.id}
                className="bg-white rounded-2xl p-4 border border-cream-200 hover:border-charcoal-light/30 transition-colors cursor-pointer shadow-sm group w-56"
              >
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', option.iconBg)}>
                  <option.icon className={cn('w-5 h-5', option.iconColor)} />
                </div>
                <h3 className="font-semibold text-charcoal text-sm mb-1">
                  {option.title}
                </h3>
                <p className="text-xs text-charcoal-light">{option.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Analytics Section */}
        <section>
          <h2 className="text-xl font-semibold text-charcoal mb-4">Your Analytics</h2>
          <div className="flex gap-4">
            {/* Main Chart Area */}
            <div className="flex-1 bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
              {/* Tabs */}
              <div className="flex gap-6 px-6 pt-4 border-b border-cream-200">
                <button className="pb-3 text-charcoal font-medium border-b-2 border-charcoal">Overview</button>
                <button className="pb-3 text-charcoal-light hover:text-charcoal transition-colors">Weekly</button>
                <button className="pb-3 text-charcoal-light hover:text-charcoal transition-colors">Monthly</button>
              </div>

              <div className="p-6">
                {/* Stats Header */}
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-bold text-charcoal">20.9</span>
                  <span className="text-lg text-charcoal-light">hours</span>
                  <span className="text-green-600 flex items-center gap-1 text-sm font-medium">
                    <TrendingUp className="w-4 h-4" />
                    +12.5%
                  </span>
                </div>
                <p className="text-sm text-charcoal-light mb-4">Total study time this week</p>

                {/* Time Period Selectors */}
                <div className="flex items-center gap-2 mb-6">
                  <button className="px-3 py-1.5 text-xs font-medium bg-charcoal text-white rounded-lg">1W</button>
                  <button className="px-3 py-1.5 text-xs font-medium text-charcoal-light hover:bg-cream-100 rounded-lg transition-colors">1M</button>
                  <button className="px-3 py-1.5 text-xs font-medium text-charcoal-light hover:bg-cream-100 rounded-lg transition-colors">3M</button>
                  <button className="px-3 py-1.5 text-xs font-medium text-charcoal-light hover:bg-cream-100 rounded-lg transition-colors">6M</button>
                  <button className="px-3 py-1.5 text-xs font-medium text-charcoal-light hover:bg-cream-100 rounded-lg transition-colors">1Y</button>
                  <button className="px-3 py-1.5 text-xs font-medium text-charcoal-light hover:bg-cream-100 rounded-lg transition-colors">ALL</button>
                </div>

                {/* Chart */}
                <div className="h-56">
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
                </div>

                {/* Bottom Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-cream-200">
                  <div>
                    <p className="text-sm text-charcoal-light">Prev Week</p>
                    <p className="font-semibold text-charcoal">18.6h</p>
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-light">Avg Daily</p>
                    <p className="font-semibold text-charcoal">2.9h</p>
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-light">Best Day</p>
                    <p className="font-semibold text-charcoal">Thu (4.1h)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-72 bg-white rounded-2xl border border-cream-200 shadow-sm">
              {/* Header */}
              <div className="px-4 py-3 border-b border-cream-200">
                <h3 className="font-semibold text-charcoal">Performance</h3>
              </div>

              {/* Stats List */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-xl">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Flame className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-charcoal">7 Day Streak</p>
                    <p className="text-xs text-charcoal-light">Keep it going!</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-charcoal">421 Questions</p>
                    <p className="text-xs text-charcoal-light">Answered this week</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-charcoal">20.9 Hours</p>
                    <p className="text-xs text-charcoal-light">Total study time</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="px-4 pb-3">
                <div className="flex border-b border-cream-200">
                  <button className="flex-1 pb-2 text-sm font-medium text-charcoal border-b-2 border-charcoal">Top Subjects</button>
                  <button className="flex-1 pb-2 text-sm text-charcoal-light hover:text-charcoal transition-colors">Weak Areas</button>
                </div>
              </div>

              {/* Subject List */}
              <div className="px-4 pb-4 space-y-2">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center text-white text-xs font-bold">CS</div>
                    <span className="text-sm text-charcoal">AP Computer Science</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">92%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center text-white text-xs font-bold">HG</div>
                    <span className="text-sm text-charcoal">AP Human Geo</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">87%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-amber-500 rounded-md flex items-center justify-center text-white text-xs font-bold">US</div>
                    <span className="text-sm text-charcoal">AP US History</span>
                  </div>
                  <span className="text-sm font-medium text-amber-600">78%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ask Anything Input */}
        <section>
          <div className="bg-white rounded-2xl border border-cream-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 bg-cream-100 rounded-xl flex items-center justify-center hover:bg-cream-200 transition-colors">
                <Plus className="w-5 h-5 text-charcoal-light" />
              </button>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask anything about studying..."
                className="flex-1 bg-transparent text-charcoal placeholder:text-charcoal-light outline-none"
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
              className="relative w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex h-[500px]">
                {/* Left Sidebar */}
                <div className="w-56 border-r border-cream-200 p-4">
                  <nav className="space-y-1">
                    {searchFilters.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={cn(
                          'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-colors',
                          activeFilter === filter.id
                            ? 'bg-cream-100 text-charcoal font-medium'
                            : 'text-charcoal-light hover:text-charcoal hover:bg-cream-50'
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
                  <div className="flex items-center gap-3 p-4 border-b border-cream-200">
                    <Search className="w-5 h-5 text-charcoal-light" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for anything..."
                      autoFocus
                      className="flex-1 bg-transparent text-charcoal placeholder:text-charcoal-light outline-none text-lg"
                    />
                    <button
                      onClick={() => setIsSearchOpen(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-100 transition-colors"
                    >
                      <X className="w-5 h-5 text-charcoal-light" />
                    </button>
                  </div>

                  {/* Recently Viewed */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-charcoal">Recently viewed</h3>
                      <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                        Clear
                      </button>
                    </div>

                    <div className="space-y-2">
                      {recentItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream-50 cursor-pointer transition-colors"
                        >
                          <div className="w-10 h-10 bg-cream-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-charcoal-light" />
                          </div>
                          <div>
                            <p className="font-medium text-charcoal">{item.title}</p>
                            <p className="text-sm text-charcoal-light">Viewed {item.viewedAt}</p>
                          </div>
                        </div>
                      ))}
                    </div>
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
