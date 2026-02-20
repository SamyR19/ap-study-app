'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Code2,
  MessageSquare,
  ClipboardList,
  FileText,
  Plus,
  ExternalLink,
  Send,
} from 'lucide-react';
import { getTopicById } from '@/data/topics';
import type { Topic } from '@/types';
import type { TopicProgress } from '@/types/course';
import { getMasteryInfo, getMasteryLevel, UNIT_INFO } from '@/types/course';
import { cn } from '@/lib/utils';

// Mock data - will be replaced with Supabase queries
const mockTopicProgress: TopicProgress = {
  id: '1',
  user_id: 'user1',
  topic_id: 'csa-1-1',
  mastery_level: 'learning',
  mastery_percentage: 45,
  flashcard_sets_count: 2,
  study_guides_count: 1,
  practice_tests_count: 0,
  code_challenges_completed: 3,
  code_challenges_due: 2,
  last_studied: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface MaterialCard {
  id: string;
  title: string;
  type: 'flashcard_set' | 'study_guide' | 'practice_test';
  createdAt: string;
  itemCount: number;
}

const mockMaterials: MaterialCard[] = [
  {
    id: 'fs-1',
    title: 'Java Basics Flashcards',
    type: 'flashcard_set',
    createdAt: new Date().toISOString(),
    itemCount: 25,
  },
  {
    id: 'sg-1',
    title: 'Unit 1 Study Guide',
    type: 'study_guide',
    createdAt: new Date().toISOString(),
    itemCount: 5,
  },
];

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [progress, setProgress] = useState<TopicProgress>(mockTopicProgress);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [materials, _setMaterials] = useState<MaterialCard[]>(mockMaterials);
  const [activeTab, setActiveTab] = useState<'materials' | 'practice' | 'tutor'>('materials');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const foundTopic = getTopicById(topicId);
    if (foundTopic) {
      setTopic(foundTopic);
      setProgress({ ...mockTopicProgress, topic_id: topicId });
    }
  }, [topicId]);

  if (!topic) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading topic...</p>
      </div>
    );
  }

  const masteryInfo = getMasteryInfo(getMasteryLevel(progress.mastery_percentage));
  const unitInfo = UNIT_INFO.find((u) => u.number === topic.unitNumber);

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || isLoading) return;

    const userMessage = chatMessage.trim();
    setChatMessage('');
    setChatHistory((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // TODO: Integrate with actual AI chat API
      // For now, simulate a response
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Great question about ${topic.name}! ${topic.description} Let me help you understand this better...`,
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Back button */}
      <button
        onClick={() => router.push('/course')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Course
      </button>

      {/* Topic Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-6 mb-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <span className="text-4xl">{topic.icon}</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: unitInfo?.color }}
                >
                  Unit {topic.unitNumber}
                </span>
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    topic.estimatedDifficulty === 'easy' && 'bg-green-100 text-green-700',
                    topic.estimatedDifficulty === 'medium' && 'bg-yellow-100 text-yellow-700',
                    topic.estimatedDifficulty === 'hard' && 'bg-red-100 text-red-700'
                  )}
                >
                  {topic.estimatedDifficulty}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{topic.name}</h1>
              <p className="text-muted-foreground">{topic.description}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {topic.conceptCount} concepts to master
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="text-right">
            <span
              className="text-sm font-medium px-3 py-1 rounded-full"
              style={{
                color: masteryInfo.color,
                backgroundColor: masteryInfo.bgColor,
              }}
            >
              {masteryInfo.label}
            </span>
            <p className="text-2xl font-bold text-foreground mt-2">
              {progress.mastery_percentage}%
            </p>
            <p className="text-xs text-muted-foreground">mastery</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: masteryInfo.color }}
              initial={{ width: 0 }}
              animate={{ width: `${progress.mastery_percentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Tab navigation */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {[
          { id: 'materials', label: 'Study Materials', icon: BookOpen },
          { id: 'practice', label: 'Code Practice', icon: Code2 },
          { id: 'tutor', label: 'AI Tutor', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-[1px]',
                activeTab === tab.id
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'materials' && (
          <div className="space-y-6">
            {/* Quick create buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href={`/create/flashcards?topic=${topicId}`}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary-300 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground group-hover:text-primary-500 transition-colors">
                    Create Flashcards
                  </p>
                  <p className="text-xs text-muted-foreground">AI-powered generation</p>
                </div>
                <Plus className="w-4 h-4 text-muted-foreground ml-auto" />
              </Link>

              <Link
                href={`/create/study-guide?topic=${topicId}`}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary-300 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground group-hover:text-primary-500 transition-colors">
                    Create Study Guide
                  </p>
                  <p className="text-xs text-muted-foreground">Comprehensive notes</p>
                </div>
                <Plus className="w-4 h-4 text-muted-foreground ml-auto" />
              </Link>

              <Link
                href={`/create/practice-test?topic=${topicId}`}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary-300 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground group-hover:text-primary-500 transition-colors">
                    Create Practice Test
                  </p>
                  <p className="text-xs text-muted-foreground">MCQ & FRQ questions</p>
                </div>
                <Plus className="w-4 h-4 text-muted-foreground ml-auto" />
              </Link>
            </div>

            {/* Existing materials */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Your Materials</h3>
              {materials.length > 0 ? (
                <div className="space-y-3">
                  {materials.map((material) => (
                    <Link
                      key={material.id}
                      href={`/library/${
                        material.type === 'flashcard_set'
                          ? 'study-sets'
                          : material.type === 'study_guide'
                          ? 'study-guides'
                          : 'practice-tests'
                      }/${material.id}`}
                      className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-foreground-light/40 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center',
                            material.type === 'flashcard_set' && 'bg-primary-100',
                            material.type === 'study_guide' && 'bg-purple-100',
                            material.type === 'practice_test' && 'bg-orange-100'
                          )}
                        >
                          {material.type === 'flashcard_set' && (
                            <Sparkles className="w-5 h-5 text-primary-500" />
                          )}
                          {material.type === 'study_guide' && (
                            <BookOpen className="w-5 h-5 text-purple-500" />
                          )}
                          {material.type === 'practice_test' && (
                            <ClipboardList className="w-5 h-5 text-orange-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{material.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {material.itemCount}{' '}
                            {material.type === 'flashcard_set'
                              ? 'cards'
                              : material.type === 'study_guide'
                              ? 'sections'
                              : 'questions'}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/50 rounded-xl border border-border">
                  <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No materials yet for this topic.</p>
                  <p className="text-sm text-muted-foreground">
                    Create flashcards, guides, or tests above.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">Code Challenges</h3>
                  <p className="text-sm text-muted-foreground">
                    Practice coding with spaced repetition
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-xl font-bold text-foreground">
                      {progress.code_challenges_completed}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Due for review</p>
                    <p className="text-xl font-bold text-primary-500">
                      {progress.code_challenges_due}
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href={`/course/code-practice?topic=${topicId}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-foreground text-white rounded-xl font-medium hover:bg-foreground/90 transition-colors"
              >
                <Code2 className="w-4 h-4" />
                Start Code Practice
              </Link>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Code practice uses spaced repetition to help you
                remember patterns and concepts. The more you practice, the longer
                intervals between reviews.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'tutor' && (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Chat header */}
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">AI Tutor</h3>
              <p className="text-sm text-muted-foreground">
                Ask questions about {topic.name}
              </p>
            </div>

            {/* Chat messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {chatHistory.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Ask me anything about {topic.name}!
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {[
                      `Explain ${topic.name}`,
                      'Give me an example',
                      'Common mistakes?',
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setChatMessage(suggestion)}
                        className="px-3 py-1.5 text-sm bg-muted text-foreground rounded-full hover:bg-muted transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                chatHistory.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] px-4 py-3 rounded-2xl',
                        message.role === 'user'
                          ? 'bg-foreground text-white rounded-br-none'
                          : 'bg-muted text-foreground rounded-bl-none'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-foreground-light rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-foreground-light rounded-full animate-bounce [animation-delay:0.1s]" />
                      <div className="w-2 h-2 bg-foreground-light rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Ask about ${topic.name}...`}
                  className="flex-1 px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim() || isLoading}
                  className={cn(
                    'px-4 py-2 rounded-xl transition-colors',
                    chatMessage.trim() && !isLoading
                      ? 'bg-foreground text-white hover:bg-foreground/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
