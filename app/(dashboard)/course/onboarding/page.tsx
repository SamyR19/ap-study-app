'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Calendar,
  Clock,
  Loader2,
} from 'lucide-react';
import { UNIT_INFO, type CurriculumVersion } from '@/types/course';
import { UNIT_INFO_9UNIT } from '@/data/topics-9unit';
import type { AssessmentQuestion } from '@/types/course';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { saveCourseOnboarding, saveAssessmentResults } from '@/lib/course-service';
import {
  assessmentQuestions4Unit,
  assessmentQuestions9Unit,
  getAssessmentQuestionsForUnits,
} from '@/data/assessment-questions';
import { AP_CSA_TOPICS } from '@/data/topics';
import { AP_CSA_9UNIT_TOPICS } from '@/data/topics-9unit';

// Helper to get topic name from topic ID
function getTopicName(topicId: string, curriculum: CurriculumVersion): string {
  const topics = curriculum === '9-unit' ? AP_CSA_9UNIT_TOPICS : AP_CSA_TOPICS;
  const topic = topics.find(t => t.id === topicId);
  return topic?.name || `Topic ${topicId.split('-').pop()}`;
}

type OnboardingStep = 'welcome' | 'curriculum' | 'unit-select' | 'assessment' | 'results';

interface AssessmentResult {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  topicId: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumVersion | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AssessmentResult[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get questions based on curriculum version and selected unit (5 per unit)
  const filteredQuestions = selectedCurriculum
    ? getAssessmentQuestionsForUnits(selectedCurriculum, selectedUnit || 1)
    : [];
  const totalQuestions = filteredQuestions.length;
  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const correctAnswers = answers.filter((a) => a.isCorrect).length;

  // Get unit info based on curriculum
  const unitInfo = selectedCurriculum === '9-unit' ? UNIT_INFO_9UNIT : UNIT_INFO;

  // Group incorrect answers by topic
  const weakTopics = answers
    .filter((a) => !a.isCorrect)
    .map((a) => a.topicId);
  const strongTopics = answers
    .filter((a) => a.isCorrect)
    .map((a) => a.topicId);

  const handleCurriculumSelect = (version: CurriculumVersion) => {
    setSelectedCurriculum(version);
  };

  const handleUnitSelect = (unitNumber: number) => {
    setSelectedUnit(unitNumber);
  };

  const handleAnswerSelect = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correct_answer_index;
    setAnswers([
      ...answers,
      {
        questionId: currentQuestion.id,
        selectedIndex: selectedAnswer,
        isCorrect,
        topicId: currentQuestion.topic_id,
      },
    ]);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setStep('results');
    }
  };

  const handleFinish = async () => {
    if (!selectedCurriculum || !selectedUnit) return;

    setIsSaving(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found');
        router.push('/login');
        return;
      }

      // Prepare question data for saving
      const questionData = answers.map((answer) => {
        const question = filteredQuestions.find(q => q.id === answer.questionId);
        return {
          question_id: answer.questionId,
          topic_id: answer.topicId,
          selected: answer.selectedIndex,
          correct: question?.correct_answer_index ?? 0,
          is_correct: answer.isCorrect,
        };
      });

      // Save course onboarding (curriculum version, current unit)
      await saveCourseOnboarding(
        user.id,
        selectedCurriculum,
        selectedUnit,
        true // has_completed_assessment
      );

      // Save assessment results
      await saveAssessmentResults(
        user.id,
        selectedCurriculum,
        selectedUnit,
        questionData,
        strongTopics,
        weakTopics
      );

      // Navigate to course page
      router.push('/course');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <AnimatePresence mode="wait">
          {/* Welcome Step */}
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-3">
                Welcome to AP Computer Science A
              </h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Let&apos;s personalize your study experience. We&apos;ll identify your
                strengths and areas that need more practice.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-muted border border-border">
                  <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Choose Curriculum</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    4-unit or 9-unit
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted border border-border">
                  <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Quick Assessment</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Test your knowledge
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted border border-border">
                  <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Custom Plan</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Personalized study path
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStep('curriculum')}
                className="inline-flex items-center gap-2 px-8 py-3 bg-foreground text-background rounded-xl font-medium hover:opacity-90 transition-colors"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Curriculum Selection Step */}
          {step === 'curriculum' && (
            <motion.div
              key="curriculum"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <button
                onClick={() => setStep('welcome')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <h2 className="text-2xl font-bold text-foreground mb-2">
                Which curriculum is your class using?
              </h2>
              <p className="text-muted-foreground mb-6">
                College Board updated the AP CSA curriculum in 2025-26.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => handleCurriculumSelect('4-unit')}
                  className={cn(
                    'p-6 rounded-xl border-2 text-left transition-all',
                    selectedCurriculum === '4-unit'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        2025-26 Curriculum
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        New 4-unit structure
                      </p>
                    </div>
                    {selectedCurriculum === '4-unit' && (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {UNIT_INFO.map((u) => (
                      <span key={u.number} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        {u.shortName}
                      </span>
                    ))}
                  </div>
                </button>

                <button
                  onClick={() => handleCurriculumSelect('9-unit')}
                  className={cn(
                    'p-6 rounded-xl border-2 text-left transition-all',
                    selectedCurriculum === '9-unit'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        Legacy Curriculum
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Original 9-unit structure
                      </p>
                    </div>
                    {selectedCurriculum === '9-unit' && (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {UNIT_INFO_9UNIT.slice(0, 5).map((u) => (
                      <span key={u.number} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        U{u.number}
                      </span>
                    ))}
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      +4 more
                    </span>
                  </div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {selectedCurriculum
                    ? `Selected: ${selectedCurriculum === '4-unit' ? '2025-26 (4-unit)' : 'Legacy (9-unit)'}`
                    : 'Select a curriculum to continue'}
                </p>
                <button
                  onClick={() => setStep('unit-select')}
                  disabled={!selectedCurriculum}
                  className={cn(
                    'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors',
                    selectedCurriculum
                      ? 'bg-foreground text-background hover:opacity-90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Unit Selection Step */}
          {step === 'unit-select' && (
            <motion.div
              key="unit-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <button
                onClick={() => setStep('curriculum')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <h2 className="text-2xl font-bold text-foreground mb-2">
                Which unit are you currently studying?
              </h2>
              <p className="text-muted-foreground mb-6">
                We&apos;ll test you on topics up to and including this unit.
              </p>

              <div className={cn(
                'grid gap-3 mb-8',
                selectedCurriculum === '9-unit' ? 'grid-cols-3' : 'grid-cols-2'
              )}>
                {unitInfo.map((unit) => (
                  <button
                    key={unit.number}
                    onClick={() => handleUnitSelect(unit.number)}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all',
                      selectedUnit === unit.number
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: unit.color }}
                      >
                        {unit.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">
                          Unit {unit.number}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {unit.shortName}
                        </p>
                      </div>
                      {selectedUnit === unit.number && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {selectedUnit
                    ? `${filteredQuestions.length} questions based on Units 1-${selectedUnit}`
                    : 'Select a unit to continue'}
                </p>
                <button
                  onClick={() => setStep('assessment')}
                  disabled={!selectedUnit}
                  className={cn(
                    'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors',
                    selectedUnit
                      ? 'bg-foreground text-background hover:opacity-90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  Start Assessment
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Assessment Step */}
          {step === 'assessment' && currentQuestion && (
            <motion.div
              key="assessment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="bg-card rounded-xl border border-border p-6 mb-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Unit {currentQuestion.unit_number} •{' '}
                  {currentQuestion.difficulty}
                </p>
                <pre className="font-mono text-foreground whitespace-pre-wrap mb-4 bg-muted p-4 rounded-lg text-sm">
                  {currentQuestion.question_text}
                </pre>

                {/* Choices */}
                <div className="space-y-3">
                  {currentQuestion.choices.map((choice) => (
                    <button
                      key={choice.index}
                      onClick={() => handleAnswerSelect(choice.index)}
                      disabled={showExplanation}
                      className={cn(
                        'w-full p-4 rounded-xl border-2 text-left transition-all',
                        selectedAnswer === choice.index &&
                          !showExplanation &&
                          'border-primary bg-primary/5',
                        selectedAnswer !== choice.index &&
                          !showExplanation &&
                          'border-border hover:border-muted-foreground/50',
                        showExplanation &&
                          choice.index ===
                            currentQuestion.correct_answer_index &&
                          'border-green-500 bg-green-500/10',
                        showExplanation &&
                          selectedAnswer === choice.index &&
                          choice.index !==
                            currentQuestion.correct_answer_index &&
                          'border-red-500 bg-red-500/10'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                            selectedAnswer === choice.index
                              ? 'bg-foreground text-background'
                              : 'bg-muted text-foreground'
                          )}
                        >
                          {String.fromCharCode(65 + choice.index)}
                        </span>
                        <span className="text-foreground">{choice.text}</span>
                        {showExplanation &&
                          choice.index ===
                            currentQuestion.correct_answer_index && (
                            <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                          )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Explanation */}
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl"
                  >
                    <p className="font-medium text-blue-600 dark:text-blue-400 mb-1">Explanation</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {currentQuestion.explanation}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end">
                {!showExplanation ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className={cn(
                      'px-6 py-3 rounded-xl font-medium transition-colors',
                      selectedAnswer !== null
                        ? 'bg-foreground text-background hover:opacity-90'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    )}
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-medium hover:opacity-90 transition-colors"
                  >
                    {currentQuestionIndex < totalQuestions - 1
                      ? 'Next Question'
                      : 'See Results'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Results Step */}
          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div
                className={cn(
                  'w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center',
                  correctAnswers >= totalQuestions * 0.7
                    ? 'bg-green-500/20'
                    : correctAnswers >= totalQuestions * 0.5
                    ? 'bg-yellow-500/20'
                    : 'bg-red-500/20'
                )}
              >
                <span className="text-3xl font-bold text-foreground">
                  {correctAnswers}/{totalQuestions}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-2">
                Assessment Complete!
              </h2>
              <p className="text-muted-foreground mb-6">
                You scored {Math.round((correctAnswers / totalQuestions) * 100)}%
                on the diagnostic test.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <p className="font-medium text-green-700 dark:text-green-400 mb-2">
                    Strong Areas
                  </p>
                  {strongTopics.length > 0 ? (
                    <ul className="text-sm text-green-600 dark:text-green-500 space-y-1.5">
                      {Array.from(new Set(strongTopics)).slice(0, 3).map((topicId) => (
                        <li key={topicId} className="truncate">
                          • {selectedCurriculum ? getTopicName(topicId, selectedCurriculum) : topicId}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-green-600 dark:text-green-500">Keep practicing!</p>
                  )}
                </div>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="font-medium text-red-700 dark:text-red-400 mb-2">
                    Focus Areas
                  </p>
                  {weakTopics.length > 0 ? (
                    <ul className="text-sm text-red-600 dark:text-red-500 space-y-1.5">
                      {Array.from(new Set(weakTopics)).slice(0, 3).map((topicId) => (
                        <li key={topicId} className="truncate">
                          • {selectedCurriculum ? getTopicName(topicId, selectedCurriculum) : topicId}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-red-600 dark:text-red-500">Great job!</p>
                  )}
                </div>
              </div>

              <button
                onClick={handleFinish}
                disabled={isSaving}
                className={cn(
                  "inline-flex items-center gap-2 px-8 py-3 bg-foreground text-background rounded-xl font-medium transition-colors",
                  isSaving ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
                )}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Start Studying
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
