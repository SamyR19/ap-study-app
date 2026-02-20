'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Clock,
  Users,
  Play,
  BarChart3,
  Zap,
  Target,
  TrendingUp,
} from 'lucide-react';

interface SavedQuiz {
  id: string;
  title: string;
  sourceType: 'flashcards' | 'ai';
  questionCount: number;
  questionType: 'mcq' | 'frq' | 'mixed';
  totalPlays: number;
  createdAt: string;
  createdBy: string;
  bestScore?: number;
  lastPlayedAt?: string;
}

interface QuizHistoryProps {
  quizzes: SavedQuiz[];
  onPlayQuiz: (quizId: string) => void;
  onViewAnalytics: (quizId: string) => void;
}

export default function QuizHistory({ quizzes, onPlayQuiz, onViewAnalytics }: QuizHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'mcq' | 'frq'>('all');

  const filteredQuizzes = quizzes.filter(q => {
    if (filter === 'all') return true;
    return q.questionType === filter || q.questionType === 'mixed';
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { id: 'all', label: 'All Quizzes' },
          { id: 'mcq', label: 'MCQ' },
          { id: 'frq', label: 'FRQ' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.id
                ? 'bg-charcoal text-white'
                : 'bg-cream-100 text-charcoal-light hover:bg-cream-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quiz list */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-12 bg-cream-50 rounded-2xl">
          <Trophy className="w-12 h-12 text-cream-300 mx-auto mb-4" />
          <p className="text-charcoal-light">No quizzes found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border border-cream-200 p-4 hover:border-primary-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-charcoal">{quiz.title}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      quiz.questionType === 'mcq'
                        ? 'bg-blue-100 text-blue-700'
                        : quiz.questionType === 'frq'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {quiz.questionType.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-charcoal-light">
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {quiz.questionCount} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {quiz.totalPlays} plays
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(quiz.createdAt)}
                    </span>
                    {quiz.bestScore !== undefined && (
                      <span className="flex items-center gap-1 text-yellow-600">
                        <Trophy className="w-4 h-4" />
                        Best: {quiz.bestScore}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewAnalytics(quiz.id)}
                    className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
                    title="View Analytics"
                  >
                    <BarChart3 className="w-5 h-5 text-charcoal-light" />
                  </button>
                  <button
                    onClick={() => onPlayQuiz(quiz.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Play
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// User Analytics Component
interface UserQuizStats {
  totalQuizzesTaken: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  totalPoints: number;
  highestScore: number;
  currentStreak: number;
  longestStreak: number;
  avgAnswerTimeMs: number;
  mcqAccuracy: number;
  frqAccuracy: number;
  recentQuizzes: {
    quizId: string;
    quizTitle: string;
    score: number;
    rank: number;
    totalParticipants: number;
    playedAt: string;
  }[];
  topicsStrength: {
    topic: string;
    accuracy: number;
    questionsAnswered: number;
  }[];
}

interface UserAnalyticsProps {
  stats: UserQuizStats;
}

export function UserAnalytics({ stats }: UserAnalyticsProps) {
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Trophy className="w-6 h-6 text-yellow-500" />}
          label="Total Points"
          value={stats.totalPoints.toLocaleString()}
          bgColor="bg-yellow-50"
        />
        <StatCard
          icon={<Target className="w-6 h-6 text-blue-500" />}
          label="Questions Answered"
          value={stats.totalQuestionsAnswered.toString()}
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-green-500" />}
          label="Accuracy"
          value={`${Math.round((stats.correctAnswers / stats.totalQuestionsAnswered) * 100)}%`}
          bgColor="bg-green-50"
        />
        <StatCard
          icon={<Zap className="w-6 h-6 text-orange-500" />}
          label="Current Streak"
          value={stats.currentStreak.toString()}
          bgColor="bg-orange-50"
        />
      </div>

      {/* Accuracy by Type */}
      <div className="bg-white rounded-xl border border-cream-200 p-5">
        <h3 className="font-semibold text-charcoal mb-4">Accuracy by Question Type</h3>
        <div className="space-y-4">
          <AccuracyBar label="Multiple Choice" accuracy={stats.mcqAccuracy} color="blue" />
          <AccuracyBar label="Free Response" accuracy={stats.frqAccuracy} color="purple" />
        </div>
      </div>

      {/* Topic Strengths */}
      {stats.topicsStrength.length > 0 && (
        <div className="bg-white rounded-xl border border-cream-200 p-5">
          <h3 className="font-semibold text-charcoal mb-4">Topic Strengths</h3>
          <div className="space-y-3">
            {stats.topicsStrength.map((topic, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-charcoal">{topic.topic}</span>
                    <span className="text-sm text-charcoal-light">{topic.accuracy}%</span>
                  </div>
                  <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${topic.accuracy}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className={`h-full ${
                        topic.accuracy >= 80 ? 'bg-green-500' :
                        topic.accuracy >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                    />
                  </div>
                </div>
                <span className="ml-4 text-xs text-charcoal-light whitespace-nowrap">
                  {topic.questionsAnswered} Q
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Quizzes */}
      {stats.recentQuizzes.length > 0 && (
        <div className="bg-white rounded-xl border border-cream-200 p-5">
          <h3 className="font-semibold text-charcoal mb-4">Recent Quizzes</h3>
          <div className="space-y-3">
            {stats.recentQuizzes.map((quiz, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-cream-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-charcoal">{quiz.quizTitle}</p>
                  <p className="text-sm text-charcoal-light">
                    #{quiz.rank} of {quiz.totalParticipants} players
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-charcoal">{quiz.score.toLocaleString()}</p>
                  <p className="text-xs text-charcoal-light">
                    {new Date(quiz.playedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="bg-white rounded-xl border border-cream-200 p-5">
        <h3 className="font-semibold text-charcoal mb-4">Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <AchievementBadge
            icon="🔥"
            label="On Fire"
            description={`${stats.longestStreak} day streak`}
            unlocked={stats.longestStreak >= 3}
          />
          <AchievementBadge
            icon="🎯"
            label="Sharpshooter"
            description="80% accuracy"
            unlocked={(stats.correctAnswers / stats.totalQuestionsAnswered) >= 0.8}
          />
          <AchievementBadge
            icon="⚡"
            label="Speed Demon"
            description="Avg < 5s"
            unlocked={stats.avgAnswerTimeMs < 5000}
          />
          <AchievementBadge
            icon="🏆"
            label="Champion"
            description="1000+ points"
            unlocked={stats.totalPoints >= 1000}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bgColor }: { icon: React.ReactNode; label: string; value: string; bgColor: string }) {
  return (
    <div className={`${bgColor} rounded-xl p-4`}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-2xl font-bold text-charcoal">{value}</p>
          <p className="text-sm text-charcoal-light">{label}</p>
        </div>
      </div>
    </div>
  );
}

function AccuracyBar({ label, accuracy, color }: { label: string; accuracy: number; color: 'blue' | 'purple' }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-charcoal">{label}</span>
        <span className="text-sm font-bold text-charcoal">{accuracy}%</span>
      </div>
      <div className="h-3 bg-cream-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${accuracy}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full ${color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'}`}
        />
      </div>
    </div>
  );
}

function AchievementBadge({ icon, label, description, unlocked }: { icon: string; label: string; description: string; unlocked: boolean }) {
  return (
    <div className={`p-3 rounded-xl text-center ${unlocked ? 'bg-primary-50 border-2 border-primary-200' : 'bg-cream-100 opacity-50'}`}>
      <span className="text-2xl">{icon}</span>
      <p className="font-medium text-charcoal text-sm mt-1">{label}</p>
      <p className="text-xs text-charcoal-light">{description}</p>
    </div>
  );
}
