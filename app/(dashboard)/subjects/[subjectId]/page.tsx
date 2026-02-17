'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TopicCard } from '@/components/dashboard/TopicCard';
import { AP_SUBJECTS } from '@/types/subjects';
import { AP_CSA_TOPICS, getUnitSummary, UNIT_COLORS } from '@/data/topics';
import { ChevronLeft, Shuffle, Target, Clock } from 'lucide-react';

type FilterType = 'all' | 'not-started' | 'in-progress' | 'mastered';

// Mock mastery data - in real app, fetch from Supabase
const mockMastery: Record<string, number> = {
  'csa-1-1': 85,
  'csa-1-2': 72,
  'csa-1-3': 45,
  'csa-2-1': 60,
  'csa-2-10': 30,
  'csa-4-10': 15,
};

export default function SubjectDetailPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;
  const [filter, setFilter] = useState<FilterType>('all');

  const subject = AP_SUBJECTS[subjectId as keyof typeof AP_SUBJECTS];

  if (!subject) {
    return (
      <div className="text-center py-12">
        <p className="text-charcoal-light">Subject not found</p>
        <Link href="/subjects">
          <Button variant="outline" className="mt-4">
            Back to Subjects
          </Button>
        </Link>
      </div>
    );
  }

  // Get topics with mastery
  const topicsWithMastery = AP_CSA_TOPICS.map((topic) => ({
    ...topic,
    mastery: mockMastery[topic.id] || 0,
  }));

  // Filter topics
  const filteredTopics = topicsWithMastery.filter((topic) => {
    if (filter === 'all') return true;
    if (filter === 'not-started') return topic.mastery === 0;
    if (filter === 'in-progress') return topic.mastery > 0 && topic.mastery < 80;
    if (filter === 'mastered') return topic.mastery >= 80;
    return true;
  });

  // Unit summary
  const units = getUnitSummary();

  // Calculate stats
  const totalQuestions = 500; // Mock
  const overallMastery = Math.round(
    topicsWithMastery.reduce((acc, t) => acc + t.mastery, 0) / topicsWithMastery.length
  );

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-charcoal-light">
        <Link href="/subjects" className="hover:text-charcoal transition-colors flex items-center">
          <ChevronLeft className="w-4 h-4" />
          Subjects
        </Link>
        <span>/</span>
        <span className="text-charcoal font-medium">{subject.name}</span>
      </nav>

      {/* Subject Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <span className="text-5xl">{subject.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-charcoal">{subject.name}</h1>
            <p className="text-charcoal-light mt-1">{subject.description}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-cream-300">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-charcoal">{totalQuestions}</p>
            <p className="text-sm text-charcoal-light">Questions</p>
          </CardContent>
        </Card>
        <Card className="border-cream-300">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-charcoal">{overallMastery}%</p>
            <p className="text-sm text-charcoal-light">Overall Mastery</p>
          </CardContent>
        </Card>
        <Card className="border-cream-300">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-charcoal">{units.length}</p>
            <p className="text-sm text-charcoal-light">Units</p>
          </CardContent>
        </Card>
        <Card className="border-cream-300">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-charcoal">{AP_CSA_TOPICS.length}</p>
            <p className="text-sm text-charcoal-light">Topics</p>
          </CardContent>
        </Card>
      </div>

      {/* Practice Modes */}
      <div className="flex flex-wrap gap-3">
        <Button className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl">
          <Shuffle className="w-4 h-4 mr-2" />
          Random Practice
        </Button>
        <Button variant="outline" className="border-cream-300 hover:bg-cream-100 rounded-xl">
          <Target className="w-4 h-4 mr-2" />
          Weak Areas Focus
        </Button>
        <Button variant="outline" className="border-cream-300 hover:bg-cream-100 rounded-xl">
          <Clock className="w-4 h-4 mr-2" />
          Timed Exam Simulation
        </Button>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
        <TabsList className="bg-cream-200 border border-cream-300">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-white data-[state=active]:text-charcoal"
          >
            All Topics
          </TabsTrigger>
          <TabsTrigger
            value="not-started"
            className="data-[state=active]:bg-white data-[state=active]:text-charcoal"
          >
            Not Started
          </TabsTrigger>
          <TabsTrigger
            value="in-progress"
            className="data-[state=active]:bg-white data-[state=active]:text-charcoal"
          >
            In Progress
          </TabsTrigger>
          <TabsTrigger
            value="mastered"
            className="data-[state=active]:bg-white data-[state=active]:text-charcoal"
          >
            Mastered
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Topics by Unit */}
      {units.map((unit) => {
        const unitTopics = filteredTopics.filter((t) => t.unitNumber === unit.unitNumber);
        if (unitTopics.length === 0) return null;

        return (
          <div key={unit.unitNumber}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: UNIT_COLORS[unit.unitNumber] }}
              >
                {unit.unitNumber}
              </div>
              <div>
                <h2 className="font-semibold text-charcoal">Unit {unit.unitNumber}</h2>
                <p className="text-sm text-charcoal-light">{unit.unitName}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-11">
              {unitTopics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  mastery={topic.mastery}
                  questionsAvailable={Math.floor(Math.random() * 30) + 10}
                  onClick={() => console.log('Practice topic:', topic.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
