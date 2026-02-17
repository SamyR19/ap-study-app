'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressBar, ActivityFeed, MasteryChart, StreakCalendar } from '@/components/progress';
import { AP_CSA_TOPICS } from '@/data/topics';
import {
  Flame,
  CheckCircle,
  Clock,
  Trophy,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type DateRange = '7d' | '30d' | 'all';

// Mock data - in production, fetch from Supabase
const mockStats = {
  currentStreak: 7,
  longestStreak: 14,
  totalQuestionsMCQ: 156,
  totalQuestionsFRQ: 23,
  correctPercentage: 78,
  previousCorrectPercentage: 72,
  totalTimeMinutes: 845,
  avgTimePerDay: 28,
  topicsMastered: 12,
  totalTopics: 57,
};

// Generate mock study days for the calendar
const generateMockStudyDays = (): Date[] => {
  const days: Date[] = [];
  const today = new Date();

  for (let i = 0; i < 84; i++) {
    // Randomly mark ~60% of days as studied
    if (Math.random() > 0.4) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date);
    }
  }
  return days;
};

// Generate mock chart data
const generateMockChartData = (range: DateRange) => {
  const data: { date: string; score: number; label: string }[] = [];
  const today = new Date();
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate realistic-looking scores
    const baseScore = 70 + Math.random() * 20;
    const trend = i / days * 10; // Slight upward trend
    const score = Math.min(100, Math.round(baseScore + trend + (Math.random() - 0.5) * 10));

    data.push({
      date: date.toISOString().split('T')[0],
      score,
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }

  // Sample every nth point for readability
  const sampleRate = range === '7d' ? 1 : range === '30d' ? 3 : 7;
  return data.filter((_, i) => i % sampleRate === 0);
};

// Generate mock activities
const generateMockActivities = () => {
  const activities = [];
  const topics = AP_CSA_TOPICS.slice(0, 10);
  const now = new Date();

  for (let i = 0; i < 8; i++) {
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const type = Math.random() > 0.3 ? 'mcq' : 'frq';
    const maxScore = type === 'mcq' ? 10 : 9;
    const score = Math.floor(Math.random() * (maxScore - 3)) + 3;

    activities.push({
      id: `activity-${i}`,
      type: type as 'mcq' | 'frq',
      topicName: topic.name,
      score,
      maxScore,
      timestamp: new Date(now.getTime() - i * 3600000 * (Math.random() * 24 + 1)),
    });
  }

  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Generate mock topic mastery data
const generateMockTopicMastery = () => {
  return AP_CSA_TOPICS.slice(0, 20).map((topic) => ({
    ...topic,
    mastery: Math.floor(Math.random() * 100),
    questionsAttempted: Math.floor(Math.random() * 50) + 5,
    lastPracticed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  }));
};

const mockStudyDays = generateMockStudyDays();
const mockActivities = generateMockActivities();
const mockTopicMastery = generateMockTopicMastery();

// Mock achievements
const achievements = [
  { id: '1', name: 'First Practice', icon: '🎯', unlocked: true, date: new Date('2024-01-15') },
  { id: '2', name: '7 Day Streak', icon: '🔥', unlocked: true, date: new Date('2024-01-22') },
  { id: '3', name: '100 Questions', icon: '💯', unlocked: true, date: new Date('2024-02-01') },
  { id: '4', name: 'Perfect FRQ', icon: '⭐', unlocked: false, requirement: 'Score 100% on an FRQ' },
  { id: '5', name: '30 Day Streak', icon: '🏆', unlocked: false, requirement: 'Study for 30 days straight' },
  { id: '6', name: 'Topic Master', icon: '🎓', unlocked: false, requirement: 'Master 10 topics (>80%)' },
];

export default function ProgressPage() {
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [sortBy, setSortBy] = useState<'mastery' | 'name' | 'recent'>('mastery');

  const chartData = generateMockChartData(dateRange);
  const trendUp = mockStats.correctPercentage > mockStats.previousCorrectPercentage;

  // Sort topics
  const sortedTopics = [...mockTopicMastery].sort((a, b) => {
    if (sortBy === 'mastery') return b.mastery - a.mastery;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return b.lastPracticed.getTime() - a.lastPracticed.getTime();
  });

  // Get weak areas (lowest 3 masteries)
  const weakAreas = [...mockTopicMastery]
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Your Progress</h1>
          <p className="text-charcoal-light mt-1">Track your learning journey</p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <TabsList className="bg-cream-200 border border-cream-300">
              <TabsTrigger
                value="7d"
                className="data-[state=active]:bg-white data-[state=active]:text-charcoal"
              >
                7 days
              </TabsTrigger>
              <TabsTrigger
                value="30d"
                className="data-[state=active]:bg-white data-[state=active]:text-charcoal"
              >
                30 days
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-white data-[state=active]:text-charcoal"
              >
                All time
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" className="border-cream-300 hover:bg-cream-100" disabled>
            <Lock className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <Card className="border-cream-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-3">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-charcoal">{mockStats.currentStreak}</p>
                <p className="text-sm text-charcoal-light">Day Streak</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-charcoal-light">Longest</p>
                <p className="text-sm font-medium text-charcoal">{mockStats.longestStreak} days</p>
              </div>
            </div>
            <div className="mt-4">
              <StreakCalendar studyDays={mockStudyDays} />
            </div>
          </CardContent>
        </Card>

        {/* Questions Answered */}
        <Card className="border-cream-300">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-charcoal">
              {mockStats.totalQuestionsMCQ + mockStats.totalQuestionsFRQ}
            </p>
            <p className="text-sm text-charcoal-light">Questions Answered</p>
            <div className="mt-3 flex items-center gap-4 text-xs text-charcoal-light">
              <span>{mockStats.totalQuestionsMCQ} MCQ</span>
              <span>{mockStats.totalQuestionsFRQ} FRQ</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span
                className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  trendUp ? 'text-success' : 'text-error'
                )}
              >
                {trendUp ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {mockStats.correctPercentage}% correct
              </span>
              <span className="text-xs text-charcoal-light">
                ({trendUp ? '+' : ''}{mockStats.correctPercentage - mockStats.previousCorrectPercentage}% vs last period)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Time Studied */}
        <Card className="border-cream-300">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-charcoal">
              {Math.floor(mockStats.totalTimeMinutes / 60)}h {mockStats.totalTimeMinutes % 60}m
            </p>
            <p className="text-sm text-charcoal-light">Time Studied</p>
            <p className="mt-3 text-xs text-charcoal-light">
              Avg. {mockStats.avgTimePerDay} min/day
            </p>
          </CardContent>
        </Card>

        {/* Topics Mastered */}
        <Card className="border-cream-300">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-xl bg-success-light flex items-center justify-center mb-3">
              <Trophy className="w-6 h-6 text-success" />
            </div>
            <p className="text-3xl font-bold text-charcoal">{mockStats.topicsMastered}</p>
            <p className="text-sm text-charcoal-light">Topics Mastered</p>
            <div className="mt-3">
              <ProgressBar
                value={(mockStats.topicsMastered / mockStats.totalTopics) * 100}
                showPercentage={false}
                size="sm"
              />
              <p className="mt-1 text-xs text-charcoal-light">
                {mockStats.topicsMastered} of {mockStats.totalTopics} topics
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="border-cream-300">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-charcoal mb-4">Performance Over Time</h2>
          <MasteryChart data={chartData} height={280} />
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topic Mastery - 2 columns */}
        <div className="lg:col-span-2">
          <Card className="border-cream-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-charcoal">Topic Mastery</h2>
                <div className="flex gap-2">
                  {(['mastery', 'name', 'recent'] as const).map((option) => (
                    <Button
                      key={option}
                      variant={sortBy === option ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy(option)}
                      className={cn(
                        'text-xs',
                        sortBy === option
                          ? 'bg-charcoal text-white hover:bg-charcoal/90'
                          : 'border-cream-300 hover:bg-cream-100'
                      )}
                    >
                      {option === 'mastery' ? 'Mastery' : option === 'name' ? 'Name' : 'Recent'}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {sortedTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-cream-50 transition-colors"
                  >
                    <span className="text-2xl">{topic.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-charcoal truncate">{topic.name}</p>
                        <span className="text-sm font-semibold text-charcoal ml-2">
                          {topic.mastery}%
                        </span>
                      </div>
                      <ProgressBar
                        value={topic.mastery}
                        showPercentage={false}
                        size="sm"
                        animate={false}
                      />
                      <p className="mt-1 text-xs text-charcoal-light">
                        {topic.questionsAttempted} questions attempted
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary-500 text-primary-500 hover:bg-primary-50 flex-shrink-0"
                    >
                      Practice
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Weak Areas */}
          <Card className="border-cream-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-charcoal">Focus Areas</h2>
              </div>
              <div className="space-y-3">
                {weakAreas.map((topic) => (
                  <div
                    key={topic.id}
                    className="p-3 rounded-xl bg-red-50 border border-red-100"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{topic.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-charcoal text-sm">{topic.name}</p>
                        <p className="text-xs text-red-600">{topic.mastery}% mastery</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-lg"
                    >
                      Start Practicing
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-cream-300">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-charcoal mb-4">Recent Activity</h2>
              <ActivityFeed
                activities={mockActivities}
                hasMore={true}
                onLoadMore={() => console.log('Load more')}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Achievements */}
      <Card className="border-cream-300">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-charcoal mb-4">Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={cn(
                  'p-4 rounded-xl text-center transition-all',
                  achievement.unlocked
                    ? 'bg-gradient-to-b from-amber-50 to-orange-50 border border-amber-200'
                    : 'bg-cream-100 border border-cream-300 opacity-60'
                )}
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <p className="font-medium text-charcoal text-sm">{achievement.name}</p>
                {achievement.unlocked && achievement.date ? (
                  <p className="text-xs text-charcoal-light mt-1">
                    {achievement.date.toLocaleDateString()}
                  </p>
                ) : (
                  <p className="text-xs text-charcoal-light mt-1">{achievement.requirement}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
