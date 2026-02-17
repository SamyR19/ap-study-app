'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AP_SUBJECTS } from '@/types/subjects';

type FilterType = 'all' | 'available' | 'coming-soon';

export default function SubjectsPage() {
  const [filter, setFilter] = useState<FilterType>('all');

  const subjects = Object.values(AP_SUBJECTS);

  const filteredSubjects = subjects.filter((subject) => {
    if (filter === 'all') return true;
    if (filter === 'available') return subject.isActive;
    if (filter === 'coming-soon') return !subject.isActive;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-charcoal">All AP Subjects</h1>
        <p className="mt-1 text-charcoal-light">
          Choose a subject to start practicing
        </p>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
        <TabsList className="bg-cream-200 border border-cream-300">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-white data-[state=active]:text-charcoal"
          >
            All ({subjects.length})
          </TabsTrigger>
          <TabsTrigger
            value="available"
            className="data-[state=active]:bg-white data-[state=active]:text-charcoal"
          >
            Available ({subjects.filter((s) => s.isActive).length})
          </TabsTrigger>
          <TabsTrigger
            value="coming-soon"
            className="data-[state=active]:bg-white data-[state=active]:text-charcoal"
          >
            Coming Soon ({subjects.filter((s) => !s.isActive).length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects.map((subject) => (
          <Link
            key={subject.id}
            href={subject.isActive ? `/subjects/${subject.id}` : '#'}
            className={subject.isActive ? '' : 'cursor-not-allowed'}
          >
            <Card
              className={`border-cream-300 h-full transition-all ${
                subject.isActive
                  ? 'hover:shadow-md hover:-translate-y-1'
                  : 'opacity-60'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-5xl">{subject.icon}</span>
                  <Badge
                    variant={subject.isActive ? 'default' : 'secondary'}
                    className={
                      subject.isActive
                        ? 'bg-success-light text-success-dark border-0'
                        : 'bg-cream-200 text-charcoal-light border-0'
                    }
                  >
                    {subject.isActive ? 'Available Now' : 'Coming Soon'}
                  </Badge>
                </div>

                <h3 className="font-bold text-lg text-charcoal mb-1">
                  {subject.name}
                </h3>
                <p className="text-sm text-charcoal-light mb-4">
                  {subject.description}
                </p>

                {/* Exam Format */}
                <div className="flex items-center gap-4 text-sm text-charcoal-light">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary-400" />
                    {subject.examFormat.mcqCount} MCQ
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    {subject.examFormat.frqCount} FRQ
                  </span>
                </div>

                {/* Time */}
                <p className="mt-2 text-xs text-charcoal-muted">
                  {Math.floor(subject.examFormat.totalTimeMinutes / 60)}h{' '}
                  {subject.examFormat.totalTimeMinutes % 60}m total exam time
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
