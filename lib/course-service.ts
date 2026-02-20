/**
 * Course Service - Supabase queries for AP CSA Course
 */

import { supabase } from './supabase';
import type {
  CurriculumVersion,
  TopicProgress,
  CodeChallenge,
  CodeChallengeProgress,
  Milestone,
} from '@/types/course';

// ============================================
// Course Onboarding
// ============================================

export interface CourseOnboardingData {
  id: string;
  user_id: string;
  curriculum_version: CurriculumVersion;
  current_unit: number;
  has_completed_assessment: boolean;
  created_at: string;
  updated_at: string;
}

export async function getCourseOnboarding(userId: string): Promise<CourseOnboardingData | null> {
  const { data, error } = await supabase
    .from('course_onboarding')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Error fetching course onboarding:', error);
    return null;
  }

  return data;
}

export async function saveCourseOnboarding(
  userId: string,
  curriculumVersion: CurriculumVersion,
  currentUnit: number,
  hasCompletedAssessment: boolean = true
): Promise<CourseOnboardingData | null> {
  const { data, error } = await supabase
    .from('course_onboarding')
    .upsert({
      user_id: userId,
      curriculum_version: curriculumVersion,
      current_unit: currentUnit,
      has_completed_assessment: hasCompletedAssessment,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving course onboarding:', error);
    return null;
  }

  return data;
}

// ============================================
// Assessment Results
// ============================================

export interface AssessmentResultData {
  id: string;
  user_id: string;
  curriculum_version: string;
  current_unit: number;
  questions: Array<{
    question_id: string;
    topic_id: string;
    selected: number;
    correct: number;
    is_correct: boolean;
  }>;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  strong_topics: string[];
  weak_topics: string[];
  completed_at: string;
}

export async function getLatestAssessment(userId: string): Promise<AssessmentResultData | null> {
  const { data, error } = await supabase
    .from('assessment_results')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching assessment:', error);
    return null;
  }

  return data;
}

export async function saveAssessmentResults(
  userId: string,
  curriculumVersion: CurriculumVersion,
  currentUnit: number,
  questions: Array<{
    question_id: string;
    topic_id: string;
    selected: number;
    correct: number;
    is_correct: boolean;
  }>,
  strongTopics: string[],
  weakTopics: string[]
): Promise<AssessmentResultData | null> {
  const totalQuestions = questions.length;
  const correctAnswers = questions.filter(q => q.is_correct).length;
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

  const { data, error } = await supabase
    .from('assessment_results')
    .insert({
      user_id: userId,
      curriculum_version: curriculumVersion,
      current_unit: currentUnit,
      questions,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      score_percentage: scorePercentage,
      strong_topics: strongTopics,
      weak_topics: weakTopics,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving assessment:', error);
    return null;
  }

  return data;
}

// ============================================
// Topic Progress
// ============================================

export async function getTopicProgress(userId: string): Promise<Record<string, TopicProgress>> {
  const { data, error } = await supabase
    .from('topic_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching topic progress:', error);
    return {};
  }

  const progressMap: Record<string, TopicProgress> = {};
  for (const item of data || []) {
    progressMap[item.topic_id] = {
      id: item.id,
      user_id: item.user_id,
      topic_id: item.topic_id,
      mastery_level: item.mastery_level,
      mastery_percentage: item.mastery_percentage,
      flashcard_sets_count: item.flashcard_sets_count,
      study_guides_count: item.study_guides_count,
      practice_tests_count: item.practice_tests_count,
      code_challenges_completed: item.code_challenges_completed,
      code_challenges_due: item.code_challenges_due,
      last_studied: item.last_studied,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  }

  return progressMap;
}

export async function updateTopicProgress(
  userId: string,
  topicId: string,
  updates: Partial<{
    mastery_level: string;
    mastery_percentage: number;
    flashcard_sets_count: number;
    study_guides_count: number;
    practice_tests_count: number;
    code_challenges_completed: number;
    code_challenges_due: number;
    last_studied: string;
  }>
): Promise<boolean> {
  const { error } = await supabase
    .from('topic_progress')
    .upsert({
      user_id: userId,
      topic_id: topicId,
      ...updates,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,topic_id',
    });

  if (error) {
    console.error('Error updating topic progress:', error);
    return false;
  }

  return true;
}

// ============================================
// Code Challenges
// ============================================

export async function getCodeChallenges(topicIds?: string[]): Promise<CodeChallenge[]> {
  let query = supabase.from('code_challenges').select('*');

  if (topicIds && topicIds.length > 0) {
    query = query.in('topic_id', topicIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching code challenges:', error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    topic_id: item.topic_id,
    title: item.title,
    description: item.description,
    difficulty: item.difficulty,
    challenge_type: item.challenge_type,
    starter_code: item.starter_code,
    solution_code: item.solution_code,
    test_cases: item.test_cases,
    hints: item.hints,
    concepts_tested: item.concepts_tested,
    estimated_minutes: item.estimated_minutes,
    created_at: item.created_at,
  }));
}

export async function getCodeChallengeById(challengeId: string): Promise<CodeChallenge | null> {
  const { data, error } = await supabase
    .from('code_challenges')
    .select('*')
    .eq('id', challengeId)
    .single();

  if (error) {
    console.error('Error fetching code challenge:', error);
    return null;
  }

  return {
    id: data.id,
    topic_id: data.topic_id,
    title: data.title,
    description: data.description,
    difficulty: data.difficulty,
    challenge_type: data.challenge_type,
    starter_code: data.starter_code,
    solution_code: data.solution_code,
    test_cases: data.test_cases,
    hints: data.hints,
    concepts_tested: data.concepts_tested,
    estimated_minutes: data.estimated_minutes,
    created_at: data.created_at,
  };
}

// ============================================
// Code Challenge Progress (Spaced Repetition)
// ============================================

export async function getChallengeProgress(userId: string): Promise<Record<string, CodeChallengeProgress>> {
  const { data, error } = await supabase
    .from('code_challenge_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching challenge progress:', error);
    return {};
  }

  const progressMap: Record<string, CodeChallengeProgress> = {};
  for (const item of data || []) {
    progressMap[item.challenge_id] = {
      id: item.id,
      user_id: item.user_id,
      challenge_id: item.challenge_id,
      ease_factor: item.ease_factor,
      interval: item.interval,
      repetitions: item.repetitions,
      next_review_date: item.next_review_date,
      attempts: item.attempts,
      successful_attempts: item.successful_attempts,
      last_attempt_code: item.last_attempt_code,
      last_attempt_passed: item.last_attempt_passed,
      last_attempt_date: item.last_attempt_date,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  }

  return progressMap;
}

export async function getDueChallenges(userId: string): Promise<Array<{
  challenge: CodeChallenge;
  progress: CodeChallengeProgress;
  dueIn: string;
}>> {
  const today = new Date().toISOString().split('T')[0];

  // Get all progress records due today or earlier
  const { data: progressData, error: progressError } = await supabase
    .from('code_challenge_progress')
    .select('*, code_challenges(*)')
    .eq('user_id', userId)
    .lte('next_review_date', today)
    .order('next_review_date', { ascending: true });

  if (progressError) {
    console.error('Error fetching due challenges:', progressError);
    return [];
  }

  return (progressData || []).map(item => {
    const reviewDate = new Date(item.next_review_date);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60));

    let dueIn = 'now';
    if (diffHours < 0) {
      dueIn = `${Math.abs(diffHours)}h`;
    }

    return {
      challenge: {
        id: item.code_challenges.id,
        topic_id: item.code_challenges.topic_id,
        title: item.code_challenges.title,
        description: item.code_challenges.description,
        difficulty: item.code_challenges.difficulty,
        challenge_type: item.code_challenges.challenge_type,
        starter_code: item.code_challenges.starter_code,
        solution_code: item.code_challenges.solution_code,
        test_cases: item.code_challenges.test_cases,
        hints: item.code_challenges.hints,
        concepts_tested: item.code_challenges.concepts_tested,
        estimated_minutes: item.code_challenges.estimated_minutes,
        created_at: item.code_challenges.created_at,
      },
      progress: {
        id: item.id,
        user_id: item.user_id,
        challenge_id: item.challenge_id,
        ease_factor: item.ease_factor,
        interval: item.interval,
        repetitions: item.repetitions,
        next_review_date: item.next_review_date,
        attempts: item.attempts,
        successful_attempts: item.successful_attempts,
        last_attempt_code: item.last_attempt_code,
        last_attempt_passed: item.last_attempt_passed,
        last_attempt_date: item.last_attempt_date,
        created_at: item.created_at,
        updated_at: item.updated_at,
      },
      dueIn,
    };
  });
}

export async function updateChallengeProgress(
  userId: string,
  challengeId: string,
  easeFactor: number,
  interval: number,
  repetitions: number,
  nextReviewDate: Date,
  attemptCode: string,
  passed: boolean
): Promise<boolean> {
  const { error } = await supabase
    .from('code_challenge_progress')
    .upsert({
      user_id: userId,
      challenge_id: challengeId,
      ease_factor: easeFactor,
      interval,
      repetitions,
      next_review_date: nextReviewDate.toISOString().split('T')[0],
      attempts: supabase.rpc('increment_attempts', { row_id: challengeId }),
      successful_attempts: passed ? supabase.rpc('increment_successful', { row_id: challengeId }) : undefined,
      last_attempt_code: attemptCode,
      last_attempt_passed: passed,
      last_attempt_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,challenge_id',
    });

  if (error) {
    console.error('Error updating challenge progress:', error);
    return false;
  }

  return true;
}

// ============================================
// Milestones
// ============================================

export async function getMilestones(userId: string): Promise<Milestone[]> {
  const { data, error } = await supabase
    .from('user_milestones')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching milestones:', error);
    return [];
  }

  // Define all possible milestones
  const allMilestones: Milestone[] = [
    {
      id: 'unit-1-complete',
      title: 'Complete Unit 1',
      description: 'Master all Primitive Types topics',
      type: 'unit_complete',
      requirement_type: 'percentage',
      requirement_value: 100,
      icon: '🎯',
      is_completed: false,
      completed_at: null,
    },
    {
      id: 'streak-7',
      title: '7-Day Streak',
      description: 'Study for 7 consecutive days',
      type: 'streak',
      requirement_type: 'streak_days',
      requirement_value: 7,
      icon: '🔥',
      is_completed: false,
      completed_at: null,
    },
    {
      id: 'challenges-10',
      title: 'First 10 Challenges',
      description: 'Complete 10 code challenges',
      type: 'challenges',
      requirement_type: 'count',
      requirement_value: 10,
      icon: '💻',
      is_completed: false,
      completed_at: null,
    },
    {
      id: 'mastery-loops',
      title: 'Master Loops',
      description: 'Achieve mastery in all loop topics',
      type: 'mastery',
      requirement_type: 'percentage',
      requirement_value: 80,
      icon: '🔄',
      is_completed: false,
      completed_at: null,
    },
  ];

  // Merge with user's completion data
  const userMilestoneMap = new Map(
    (data || []).map(m => [m.milestone_id, m])
  );

  return allMilestones.map(milestone => {
    const userData = userMilestoneMap.get(milestone.id);
    if (userData) {
      return {
        ...milestone,
        is_completed: userData.is_completed,
        completed_at: userData.completed_at,
      };
    }
    return milestone;
  });
}

export async function completeMilestone(userId: string, milestoneId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_milestones')
    .upsert({
      user_id: userId,
      milestone_id: milestoneId,
      milestone_type: 'custom', // Will be overwritten by actual type
      is_completed: true,
      completed_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,milestone_id',
    });

  if (error) {
    console.error('Error completing milestone:', error);
    return false;
  }

  return true;
}

// ============================================
// Study Sessions (for streak)
// ============================================

export async function recordStudySession(
  userId: string,
  topicId: string | null,
  sessionType: 'flashcards' | 'code_practice' | 'study_guide' | 'practice_test' | 'ai_tutor',
  durationSeconds: number
): Promise<boolean> {
  const { error } = await supabase
    .from('study_sessions')
    .insert({
      user_id: userId,
      topic_id: topicId,
      session_type: sessionType,
      duration_seconds: durationSeconds,
      session_date: new Date().toISOString().split('T')[0],
    });

  if (error) {
    console.error('Error recording study session:', error);
    return false;
  }

  return true;
}

export async function getStudyStreak(userId: string): Promise<number> {
  // Get all distinct study dates, ordered by date descending
  const { data, error } = await supabase
    .from('study_sessions')
    .select('session_date')
    .eq('user_id', userId)
    .order('session_date', { ascending: false });

  if (error || !data || data.length === 0) {
    return 0;
  }

  // Get unique dates
  const uniqueDates = Array.from(new Set(data.map(d => d.session_date))).sort().reverse();

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Check if there's activity today or yesterday
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i - 1]);
    const prevDate = new Date(uniqueDates[i]);
    const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
