'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AP_SUBJECTS } from '@/types/subjects';
import { Flame, CheckCircle, Award, ArrowRight } from 'lucide-react';

// Mock data - in real app, fetch from Supabase
const mockStats = {
  streak: 7,
  questionsAnswered: 234,
  averageScore: 78,
};

const mockLastPracticed = {
  topicName: 'Arrays',
  topicIcon: '📚',
  mastery: 65,
  subjectId: 'ap-csa',
};

const mockWeakAreas = [
  { id: '1', name: 'Recursion', mastery: 32, subject: 'ap-csa' },
  { id: '2', name: '2D Arrays', mastery: 45, subject: 'ap-csa' },
  { id: '3', name: 'Inheritance', mastery: 52, subject: 'ap-csa' },
];

export default function DashboardPage() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subjects = Object.values(AP_SUBJECTS);

  return (
    <div className="space-y-12">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Welcome back, Student!</h1>
        <p className="mt-1 text-sm text-charcoal-light">{today}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak Card */}
        <Card className="border-cream-300 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                <Flame className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-charcoal">{mockStats.streak}</p>
                <p className="text-sm text-charcoal-light">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Card */}
        <Card className="border-cream-300 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success-light flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-3xl font-bold text-charcoal">{mockStats.questionsAnswered}</p>
                <p className="text-sm text-charcoal-light">Questions Answered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Score Card */}
        <Card className="border-cream-300 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-charcoal">{mockStats.averageScore}%</p>
                <p className="text-sm text-charcoal-light">Average Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Practicing */}
      <div>
        <h2 className="text-lg font-semibold text-charcoal mb-4">Continue Where You Left Off</h2>
        <Card className="border-cream-300 hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{mockLastPracticed.topicIcon}</span>
              <div>
                <p className="font-semibold text-charcoal">{mockLastPracticed.topicName}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Progress value={mockLastPracticed.mastery} className="w-32 h-2" />
                  <span className="text-sm text-charcoal-light">{mockLastPracticed.mastery}% mastery</span>
                </div>
              </div>
            </div>
            <Button className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl">
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Subject Selection */}
      <div>
        <h2 className="text-lg font-semibold text-charcoal mb-4">Choose Your Subject</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.slice(0, 6).map((subject) => (
            <Link
              key={subject.id}
              href={subject.isActive ? `/subjects/${subject.id}` : '#'}
              className={subject.isActive ? '' : 'cursor-not-allowed'}
            >
              <Card
                className={`border-cream-300 transition-all ${
                  subject.isActive
                    ? 'hover:shadow-md hover:-translate-y-0.5'
                    : 'opacity-60'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-4xl">{subject.icon}</span>
                    <Badge
                      variant={subject.isActive ? 'default' : 'secondary'}
                      className={
                        subject.isActive
                          ? 'bg-success-light text-success-dark border-0'
                          : 'bg-cream-200 text-charcoal-light border-0'
                      }
                    >
                      {subject.isActive ? 'Available' : 'Coming Soon'}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-charcoal">{subject.name}</h3>
                  <p className="text-sm text-charcoal-light mt-1">
                    {subject.examFormat.mcqCount} MCQ + {subject.examFormat.frqCount} FRQ
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/subjects">
            <Button variant="outline" className="border-cream-300 hover:bg-cream-100">
              View All Subjects
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Weak Areas */}
      <div>
        <h2 className="text-lg font-semibold text-charcoal mb-4">Weak Areas to Focus On</h2>
        <div className="space-y-3">
          {mockWeakAreas.map((area) => (
            <Card key={area.id} className="border-cream-300 hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor:
                        area.mastery < 40 ? '#FCEAEA' : area.mastery < 60 ? '#FEF5F2' : '#E8F5EB',
                    }}
                  >
                    <span className="text-lg">
                      {area.mastery < 40 ? '🔴' : area.mastery < 60 ? '🟠' : '🟢'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">{area.name}</p>
                    <p className="text-sm text-charcoal-light">{area.mastery}% mastery</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary-500 text-primary-500 hover:bg-primary-50"
                >
                  Practice
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
