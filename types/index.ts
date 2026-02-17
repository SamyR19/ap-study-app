// ============================================
// ENUM TYPES
// ============================================

export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionType = 'mcq' | 'frq';

export type SubjectType =
  | 'ap-csa'
  | 'ap-calc-ab'
  | 'ap-calc-bc'
  | 'ap-bio'
  | 'ap-chem'
  | 'ap-physics-1'
  | 'ap-physics-2'
  | 'ap-physics-c-mech'
  | 'ap-physics-c-em'
  | 'apush'
  | 'ap-world'
  | 'ap-euro'
  | 'ap-gov'
  | 'ap-econ-micro'
  | 'ap-econ-macro'
  | 'ap-psych'
  | 'ap-lang'
  | 'ap-lit'
  | 'ap-spanish'
  | 'ap-french'
  | 'ap-german'
  | 'ap-chinese'
  | 'ap-japanese'
  | 'ap-stats'
  | 'ap-environmental';

export type SubscriptionPlan = 'free' | 'premium';

export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';

export type SubmissionStatus = 'pending' | 'correct' | 'incorrect' | 'partial';

// ============================================
// CORE TYPES
// ============================================

/**
 * User profile and preferences
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  subscription: Subscription;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  daily_goal_minutes: number;
  preferred_subjects: SubjectType[];
  study_reminder_time?: string; // HH:mm format
}

/**
 * Subscription details
 */
export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

/**
 * AP Subject configuration
 */
export interface Subject {
  id: SubjectType;
  name: string;
  shortName: string;
  icon: string; // emoji
  color: string; // hex color
  description: string;
  examFormat: ExamFormat;
  isActive: boolean; // whether the subject has content available
}

export interface ExamFormat {
  mcqCount: number;
  mcqTimeMinutes: number;
  mcqPercentage: number;
  frqCount: number;
  frqTimeMinutes: number;
  frqPercentage: number;
  totalTimeMinutes: number;
}

/**
 * Topic within a subject
 */
export interface Topic {
  id: string;
  name: string;
  subject: SubjectType;
  unitNumber: number;
  unitName: string;
  description: string;
  icon: string; // emoji
  estimatedDifficulty: Difficulty;
  conceptCount: number;
  order: number;
}

// ============================================
// QUESTION TYPES
// ============================================

/**
 * Multiple Choice Question
 */
export interface MCQ {
  id: string;
  subject: SubjectType;
  topic_id: string;
  question_text: string;
  question_html?: string; // Rich text with code blocks, etc.
  choices: MCQChoice[];
  correct_answer_index: number;
  explanation: string;
  explanation_html?: string;
  difficulty: Difficulty;
  tags: string[];
  code_snippet?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MCQChoice {
  index: number;
  text: string;
  text_html?: string;
}

/**
 * Free Response Question
 */
export interface FRQ {
  id: string;
  subject: SubjectType;
  topic_id: string;
  prompt: string;
  prompt_html?: string;
  starter_code?: string;
  language?: 'java' | 'python' | 'javascript';
  rubric: FRQRubricItem[];
  test_cases: FRQTestCase[];
  sample_solution?: string;
  total_points: number;
  difficulty: Difficulty;
  time_estimate_minutes: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface FRQRubricItem {
  id: string;
  description: string;
  points: number;
  criteria: string[];
}

export interface FRQTestCase {
  id: string;
  input: string;
  expected_output: string;
  is_hidden: boolean;
  description?: string;
  points: number;
}

// ============================================
// USER PROGRESS & SUBMISSIONS
// ============================================

/**
 * User progress for a specific topic
 */
export interface UserProgress {
  id: string;
  user_id: string;
  subject: SubjectType;
  topic_id: string;
  mastery_percentage: number; // 0-100
  questions_attempted: number;
  questions_correct: number;
  time_spent_minutes: number;
  last_practiced: string;
  streak_days: number;
  created_at: string;
  updated_at: string;
}

/**
 * Subject-level progress summary
 */
export interface SubjectProgress {
  subject: SubjectType;
  overall_mastery: number;
  topics_completed: number;
  total_topics: number;
  total_questions_attempted: number;
  total_questions_correct: number;
  total_time_spent_minutes: number;
  last_practiced: string;
}

/**
 * MCQ Submission
 */
export interface MCQSubmission {
  id: string;
  user_id: string;
  question_id: string;
  selected_answer_index: number;
  is_correct: boolean;
  time_taken_seconds: number;
  created_at: string;
}

/**
 * FRQ Submission
 */
export interface FRQSubmission {
  id: string;
  user_id: string;
  question_id: string;
  submitted_code: string;
  language: string;
  test_results: FRQTestResult[];
  rubric_scores: FRQRubricScore[];
  total_score: number;
  max_score: number;
  ai_feedback?: string;
  time_taken_seconds: number;
  status: SubmissionStatus;
  created_at: string;
}

export interface FRQTestResult {
  test_case_id: string;
  passed: boolean;
  actual_output?: string;
  error_message?: string;
  execution_time_ms?: number;
}

export interface FRQRubricScore {
  rubric_item_id: string;
  points_earned: number;
  feedback?: string;
}

/**
 * Study streak tracking
 */
export interface StudyStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_study_date: string;
  total_study_days: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// CODE EXECUTION (Judge0)
// ============================================

export interface Judge0Submission {
  language_id: number;
  source_code: string;
  stdin?: string;
  expected_output?: string;
}

export interface Judge0Result {
  token: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string;
  memory: number;
}

export interface Judge0Language {
  id: number;
  name: string;
}

// ============================================
// UI & COMPONENT TYPES
// ============================================

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
}

export interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  color?: string;
}

export interface PricingPlan {
  name: string;
  price: number;
  period: 'month' | 'year';
  description: string;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
  content: string;
  rating: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ============================================
// STUDY SESSION TYPES
// ============================================

export interface StudySession {
  id: string;
  user_id: string;
  subject: SubjectType;
  topic_id?: string;
  mode: 'practice' | 'timed' | 'review';
  questions_answered: number;
  questions_correct: number;
  duration_minutes: number;
  started_at: string;
  ended_at?: string;
}

export interface StudyGoal {
  id: string;
  user_id: string;
  type: 'daily_minutes' | 'weekly_questions' | 'mastery_target';
  target_value: number;
  current_value: number;
  period_start: string;
  period_end: string;
}
