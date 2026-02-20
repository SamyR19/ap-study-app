// ============================================
// COURSE PAGE TYPES
// ============================================

import type { Difficulty } from './index';

/**
 * Curriculum version - 4-unit (2025-26) or 9-unit (legacy)
 */
export type CurriculumVersion = '4-unit' | '9-unit';

/**
 * Mastery level for topics
 */
export type MasteryLevel = 'not_started' | 'learning' | 'familiar' | 'mastered';

/**
 * User's progress on a specific topic
 */
export interface TopicProgress {
  id: string;
  user_id: string;
  topic_id: string;
  mastery_level: MasteryLevel;
  mastery_percentage: number; // 0-100

  // Study materials created for this topic
  flashcard_sets_count: number;
  study_guides_count: number;
  practice_tests_count: number;

  // Code practice specific
  code_challenges_completed: number;
  code_challenges_due: number;

  last_studied: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Unit-level progress summary
 */
export interface UnitProgress {
  unit_number: number;
  unit_name: string;
  short_name: string;
  topics_count: number;
  topics_mastered: number;
  topics_in_progress: number;
  topics_not_started: number;
  overall_mastery: number; // 0-100
  color: string;
}

/**
 * Code challenge for free-write practice
 */
export interface CodeChallenge {
  id: string;
  topic_id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  challenge_type: 'write_method' | 'fix_bug' | 'predict_output' | 'complete_code';
  starter_code: string;
  solution_code: string;
  test_cases: CodeChallengeTestCase[];
  hints: string[];
  concepts_tested: string[];
  estimated_minutes: number;
  created_at: string;
}

export interface CodeChallengeTestCase {
  id: string;
  input: string;
  expected_output: string;
  description: string;
  is_hidden: boolean;
}

/**
 * User's progress on a code challenge (spaced repetition)
 */
export interface CodeChallengeProgress {
  id: string;
  user_id: string;
  challenge_id: string;

  // SM-2 algorithm fields
  ease_factor: number;       // Default 2.5
  interval: number;          // Days until next review
  repetitions: number;       // Consecutive correct reviews
  next_review_date: string;

  // Performance tracking
  attempts: number;
  successful_attempts: number;
  last_attempt_code: string | null;
  last_attempt_passed: boolean;
  last_attempt_date: string | null;

  created_at: string;
  updated_at: string;
}

/**
 * User's course onboarding/assessment data
 */
export interface CourseOnboarding {
  id: string;
  user_id: string;
  curriculum_version: CurriculumVersion; // 4-unit (2025-26) or 9-unit (legacy)
  current_unit: number; // 1-4 for 4-unit, 1-9 for 9-unit
  has_completed_assessment: boolean;
  assessment_results: AssessmentResults | null;
  created_at: string;
  updated_at: string;
}

export interface AssessmentResults {
  completed_at: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  strong_topics: string[]; // topic IDs
  weak_topics: string[];   // topic IDs (pain points)
  recommended_focus: string[]; // topic IDs to focus on
}

/**
 * Assessment question for diagnostic test
 */
export interface AssessmentQuestion {
  id: string;
  topic_id: string;
  unit_number: number;
  question_text: string;
  code_snippet?: string;
  choices: { index: number; text: string }[];
  correct_answer_index: number;
  explanation: string;
  difficulty: Difficulty;
  question_type?: 'mcq' | 'frq';
}

/**
 * Milestone for progress roadmap
 */
export interface Milestone {
  id: string;
  title: string;
  description: string;
  type: 'unit_complete' | 'streak' | 'challenges' | 'mastery' | 'custom';
  requirement_type: 'count' | 'percentage' | 'streak_days';
  requirement_value: number;
  icon: string; // emoji
  is_completed: boolean;
  completed_at: string | null;
}

/**
 * Roadmap node for visual progress display
 */
export interface RoadmapNode {
  topic_id: string;
  topic_name: string;
  unit_number: number;
  position: number; // Order in the roadmap
  status: 'completed' | 'current' | 'upcoming' | 'locked';
  is_pain_point: boolean;
  mastery_percentage: number;
}

// ============================================
// HELPER TYPES
// ============================================

export interface UnitInfo {
  number: number;
  name: string;
  shortName: string;
  color: string;
  topicCount: number;
}

export const UNIT_INFO: UnitInfo[] = [
  { number: 1, name: 'Primitive Types', shortName: 'Primitives', color: '#E07856', topicCount: 5 },
  { number: 2, name: 'Using Objects, Boolean Expressions, If Statements, Iteration', shortName: 'Objects & Control', color: '#6B9E78', topicCount: 21 },
  { number: 3, name: 'Writing Classes, Arrays, ArrayLists', shortName: 'Classes & Data', color: '#7B68EE', topicCount: 20 },
  { number: 4, name: '2D Arrays, Inheritance, Recursion', shortName: 'Advanced', color: '#2196F3', topicCount: 11 },
];

/**
 * Get mastery level from percentage
 */
export function getMasteryLevel(percentage: number): MasteryLevel {
  if (percentage === 0) return 'not_started';
  if (percentage < 40) return 'learning';
  if (percentage < 80) return 'familiar';
  return 'mastered';
}

/**
 * Get mastery level display info
 */
export function getMasteryInfo(level: MasteryLevel): { label: string; color: string; bgColor: string } {
  switch (level) {
    case 'not_started':
      return { label: 'Not Started', color: '#6B6B6B', bgColor: '#E8E4DD' };
    case 'learning':
      return { label: 'Learning', color: '#E07856', bgColor: '#FEF3E2' };
    case 'familiar':
      return { label: 'Familiar', color: '#2196F3', bgColor: '#E3F2FD' };
    case 'mastered':
      return { label: 'Mastered', color: '#6B9E78', bgColor: '#E8F5E9' };
  }
}
