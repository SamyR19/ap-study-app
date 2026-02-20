'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Code2,
  Zap,
  Clock,
  ArrowLeft,
  Play,
  Filter,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { getTopicById } from '@/data/topics';
import { UNIT_INFO } from '@/types/course';
import type { CodeChallenge, CodeChallengeProgress } from '@/types/course';
import { formatTimeUntilReview } from '@/lib/spaced-repetition';
import { cn } from '@/lib/utils';

// Mock data for code challenges
const mockChallenges: CodeChallenge[] = [
  {
    id: 'ch-1',
    topic_id: 'csa-2-18',
    title: 'Sum of Array Elements',
    description: 'Write a method that returns the sum of all elements in an integer array.',
    difficulty: 'easy',
    challenge_type: 'write_method',
    starter_code: 'public static int sumArray(int[] arr) {\n    // Your code here\n}',
    solution_code: 'public static int sumArray(int[] arr) {\n    int sum = 0;\n    for (int num : arr) {\n        sum += num;\n    }\n    return sum;\n}',
    test_cases: [
      { id: 't1', input: '[1, 2, 3, 4, 5]', expected_output: '15', description: 'Basic sum', is_hidden: false },
      { id: 't2', input: '[]', expected_output: '0', description: 'Empty array', is_hidden: false },
    ],
    hints: ['Use a for-each loop', 'Initialize a sum variable to 0'],
    concepts_tested: ['For Loops', 'Arrays', 'Accumulator Pattern'],
    estimated_minutes: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ch-2',
    topic_id: 'csa-2-7',
    title: 'Reverse a String',
    description: 'Write a method that reverses a string without using StringBuilder.',
    difficulty: 'medium',
    challenge_type: 'write_method',
    starter_code: 'public static String reverse(String s) {\n    // Your code here\n}',
    solution_code: 'public static String reverse(String s) {\n    String result = "";\n    for (int i = s.length() - 1; i >= 0; i--) {\n        result += s.charAt(i);\n    }\n    return result;\n}',
    test_cases: [
      { id: 't1', input: '"hello"', expected_output: '"olleh"', description: 'Basic string', is_hidden: false },
      { id: 't2', input: '""', expected_output: '""', description: 'Empty string', is_hidden: false },
    ],
    hints: ['Loop from the end of the string', 'Use charAt() to get individual characters'],
    concepts_tested: ['String Methods', 'For Loops', 'String Building'],
    estimated_minutes: 10,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ch-3',
    topic_id: 'csa-3-14',
    title: 'Find Maximum',
    description: 'Write a method that finds the maximum value in an array.',
    difficulty: 'easy',
    challenge_type: 'write_method',
    starter_code: 'public static int findMax(int[] arr) {\n    // Your code here\n}',
    solution_code: 'public static int findMax(int[] arr) {\n    int max = arr[0];\n    for (int num : arr) {\n        if (num > max) max = num;\n    }\n    return max;\n}',
    test_cases: [
      { id: 't1', input: '[3, 1, 4, 1, 5, 9]', expected_output: '9', description: 'Multiple elements', is_hidden: false },
    ],
    hints: ['Start with the first element as max', 'Compare each element'],
    concepts_tested: ['Arrays', 'Finding Maximum', 'Comparison'],
    estimated_minutes: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ch-4',
    topic_id: 'csa-4-10',
    title: 'Factorial (Recursive)',
    description: 'Write a recursive method that calculates n factorial.',
    difficulty: 'hard',
    challenge_type: 'write_method',
    starter_code: 'public static int factorial(int n) {\n    // Your code here\n}',
    solution_code: 'public static int factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}',
    test_cases: [
      { id: 't1', input: '5', expected_output: '120', description: '5! = 120', is_hidden: false },
      { id: 't2', input: '0', expected_output: '1', description: '0! = 1', is_hidden: false },
    ],
    hints: ['Base case: n <= 1', 'Recursive case: n * factorial(n-1)'],
    concepts_tested: ['Recursion', 'Base Case', 'Recursive Call'],
    estimated_minutes: 15,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ch-5',
    topic_id: 'csa-2-17',
    title: 'Count Occurrences',
    description: 'Write a method that counts how many times a value appears in an array.',
    difficulty: 'medium',
    challenge_type: 'write_method',
    starter_code: 'public static int countOccurrences(int[] arr, int target) {\n    // Your code here\n}',
    solution_code: 'public static int countOccurrences(int[] arr, int target) {\n    int count = 0;\n    for (int num : arr) {\n        if (num == target) count++;\n    }\n    return count;\n}',
    test_cases: [
      { id: 't1', input: '[1,2,2,3,2], 2', expected_output: '3', description: 'Multiple occurrences', is_hidden: false },
    ],
    hints: ['Use a counter variable', 'Check each element against target'],
    concepts_tested: ['While Loops', 'Counting', 'Comparison'],
    estimated_minutes: 8,
    created_at: new Date().toISOString(),
  },
];

// Mock progress data
const mockProgress: Record<string, CodeChallengeProgress> = {
  'ch-1': {
    id: 'p1',
    user_id: 'user1',
    challenge_id: 'ch-1',
    ease_factor: 2.5,
    interval: 1,
    repetitions: 0,
    next_review_date: new Date().toISOString(), // Due now
    attempts: 2,
    successful_attempts: 1,
    last_attempt_code: null,
    last_attempt_passed: false,
    last_attempt_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'ch-2': {
    id: 'p2',
    user_id: 'user1',
    challenge_id: 'ch-2',
    ease_factor: 2.5,
    interval: 1,
    repetitions: 0,
    next_review_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
    attempts: 0,
    successful_attempts: 0,
    last_attempt_code: null,
    last_attempt_passed: false,
    last_attempt_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'ch-3': {
    id: 'p3',
    user_id: 'user1',
    challenge_id: 'ch-3',
    ease_factor: 2.8,
    interval: 6,
    repetitions: 2,
    next_review_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    attempts: 3,
    successful_attempts: 2,
    last_attempt_code: null,
    last_attempt_passed: true,
    last_attempt_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export default function CodePracticePage() {
  const searchParams = useSearchParams();
  const topicFilter = searchParams.get('topic');

  const [selectedUnit, setSelectedUnit] = useState<number | null>(
    topicFilter ? getTopicById(topicFilter)?.unitNumber ?? null : null
  );

  // Filter challenges
  const filteredChallenges = mockChallenges.filter((c) => {
    if (selectedUnit) {
      const topic = getTopicById(c.topic_id);
      return topic?.unitNumber === selectedUnit;
    }
    if (topicFilter) {
      return c.topic_id === topicFilter;
    }
    return true;
  });

  // Separate due and upcoming
  const now = new Date();
  const dueChallenges = filteredChallenges.filter((c) => {
    const progress = mockProgress[c.id];
    if (!progress) return true; // New challenge
    return new Date(progress.next_review_date) <= now;
  });

  const upcomingChallenges = filteredChallenges.filter((c) => {
    const progress = mockProgress[c.id];
    if (!progress) return false;
    return new Date(progress.next_review_date) > now;
  });

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/course"
            className="flex items-center gap-2 text-charcoal-light hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-charcoal flex items-center gap-2">
              <Code2 className="w-6 h-6 text-primary-500" />
              Debugging Dojo
            </h1>
            <p className="text-charcoal-light">
              Build muscle memory through spaced repetition
            </p>
          </div>
        </div>
      </div>

      {/* Unit filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-charcoal-light flex-shrink-0" />
        <button
          onClick={() => setSelectedUnit(null)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            selectedUnit === null
              ? 'bg-charcoal text-white'
              : 'bg-cream-100 text-charcoal hover:bg-cream-200'
          )}
        >
          All Units
        </button>
        {UNIT_INFO.map((unit) => (
          <button
            key={unit.number}
            onClick={() => setSelectedUnit(unit.number)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              selectedUnit === unit.number
                ? 'text-white'
                : 'bg-cream-100 text-charcoal hover:bg-cream-200'
            )}
            style={
              selectedUnit === unit.number
                ? { backgroundColor: unit.color }
                : undefined
            }
          >
            Unit {unit.number}
          </button>
        ))}
      </div>

      {/* Due Today section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-charcoal flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Due Now ({dueChallenges.length})
          </h2>
          {dueChallenges.length > 0 && (
            <Link
              href={`/course/code-practice/${dueChallenges[0].id}`}
              className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-xl text-sm font-medium hover:bg-charcoal/90 transition-colors"
            >
              <Play className="w-4 h-4" />
              Start Practice
            </Link>
          )}
        </div>

        {dueChallenges.length > 0 ? (
          <div className="space-y-3">
            {dueChallenges.map((challenge, index) => {
              const topic = getTopicById(challenge.topic_id);

              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/course/code-practice/${challenge.id}`}>
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-cream-200 hover:border-primary-300 hover:shadow-sm transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <div>
                          <p className="font-medium text-charcoal">
                            {challenge.title}
                          </p>
                          <p className="text-sm text-charcoal-light">
                            {topic?.name} •{' '}
                            {challenge.concepts_tested.slice(0, 2).join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full',
                            challenge.difficulty === 'easy' &&
                              'bg-green-100 text-green-700',
                            challenge.difficulty === 'medium' &&
                              'bg-yellow-100 text-yellow-700',
                            challenge.difficulty === 'hard' &&
                              'bg-red-100 text-red-700'
                          )}
                        >
                          {challenge.difficulty}
                        </span>
                        <span className="text-sm text-red-500 font-medium">
                          Due now
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-green-50 rounded-xl border border-green-200">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="font-medium text-green-800">All caught up!</p>
            <p className="text-sm text-green-600">
              No challenges due right now. Check back later!
            </p>
          </div>
        )}
      </motion.section>

      {/* Coming Up section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="font-semibold text-charcoal flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-500" />
          Coming Up ({upcomingChallenges.length})
        </h2>

        {upcomingChallenges.length > 0 ? (
          <div className="space-y-3">
            {upcomingChallenges.map((challenge, index) => {
              const progress = mockProgress[challenge.id];
              const topic = getTopicById(challenge.topic_id);

              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                >
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-cream-200">
                    <div className="flex items-center gap-4">
                      <Circle className="w-4 h-4 text-cream-300" />
                      <div>
                        <p className="font-medium text-charcoal">
                          {challenge.title}
                        </p>
                        <p className="text-sm text-charcoal-light">
                          {topic?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          challenge.difficulty === 'easy' &&
                            'bg-green-100 text-green-700',
                          challenge.difficulty === 'medium' &&
                            'bg-yellow-100 text-yellow-700',
                          challenge.difficulty === 'hard' &&
                            'bg-red-100 text-red-700'
                        )}
                      >
                        {challenge.difficulty}
                      </span>
                      <span className="text-sm text-charcoal-light">
                        {progress
                          ? formatTimeUntilReview(progress.next_review_date)
                          : 'New'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 bg-cream-50 rounded-xl border border-cream-200">
            <p className="text-charcoal-light">No upcoming challenges scheduled.</p>
          </div>
        )}
      </motion.section>

      {/* All Challenges by Topic */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="font-semibold text-charcoal mb-4">
          All Challenges ({filteredChallenges.length})
        </h2>

        <div className="space-y-4">
          {UNIT_INFO.filter((u) => !selectedUnit || u.number === selectedUnit).map(
            (unit) => {
              const unitChallenges = filteredChallenges.filter((c) => {
                const topic = getTopicById(c.topic_id);
                return topic?.unitNumber === unit.number;
              });

              if (unitChallenges.length === 0) return null;

              return (
                <div
                  key={unit.number}
                  className="bg-white rounded-xl border border-cream-200 overflow-hidden"
                >
                  <div
                    className="px-4 py-3 flex items-center gap-3"
                    style={{ backgroundColor: `${unit.color}15` }}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: unit.color }}
                    >
                      {unit.number}
                    </div>
                    <span className="font-medium text-charcoal">
                      {unit.shortName}
                    </span>
                    <span className="text-sm text-charcoal-light">
                      {unitChallenges.length} challenges
                    </span>
                  </div>
                  <div className="divide-y divide-cream-100">
                    {unitChallenges.map((challenge) => {
                      const progress = mockProgress[challenge.id];
                      const topic = getTopicById(challenge.topic_id);
                      const isCompleted =
                        progress && progress.successful_attempts > 0;

                      return (
                        <Link
                          key={challenge.id}
                          href={`/course/code-practice/${challenge.id}`}
                          className="flex items-center justify-between p-4 hover:bg-cream-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-cream-300" />
                            )}
                            <div>
                              <p className="font-medium text-charcoal">
                                {challenge.title}
                              </p>
                              <p className="text-xs text-charcoal-light">
                                {topic?.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                'text-xs px-2 py-0.5 rounded-full',
                                challenge.difficulty === 'easy' &&
                                  'bg-green-100 text-green-700',
                                challenge.difficulty === 'medium' &&
                                  'bg-yellow-100 text-yellow-700',
                                challenge.difficulty === 'hard' &&
                                  'bg-red-100 text-red-700'
                              )}
                            >
                              {challenge.difficulty}
                            </span>
                            <span className="text-xs text-charcoal-light">
                              ~{challenge.estimated_minutes}m
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </motion.section>
    </div>
  );
}
