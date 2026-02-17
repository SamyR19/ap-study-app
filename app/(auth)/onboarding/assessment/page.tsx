'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Clock,
  Loader2,
  Trophy,
  Target,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MCQ_BANK, MCQQuestion } from '@/data/mcq-bank';
import { FRQ_BANK, FRQQuestion } from '@/data/frq-bank';
import { SimpleCodeEditor } from '@/components/CodeEditor';

interface AssessmentQuestion {
  type: 'mcq' | 'frq';
  question: MCQQuestion | FRQQuestion;
}

interface Answer {
  questionId: string;
  type: 'mcq' | 'frq';
  answer: string | null;
  isCorrect?: boolean;
}

export default function AssessmentPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Timer
  useEffect(() => {
    if (showResults) return;
    const interval = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, showResults]);

  // Generate questions based on completed units
  useEffect(() => {
    const onboardingData = localStorage.getItem('onboardingData');
    let completedUnits: string[] = [];

    if (onboardingData) {
      const parsed = JSON.parse(onboardingData);
      completedUnits = parsed.completedUnits || [];
    }

    // If no units selected, use all available
    if (completedUnits.length === 0) {
      completedUnits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    }

    // Filter questions by completed units
    const relevantMCQs = MCQ_BANK.filter(q => {
      const topicUnit = getUnitFromTopic(q.topic);
      return completedUnits.includes(topicUnit.toString());
    });

    const relevantFRQs = FRQ_BANK.filter(q => {
      const topicUnit = getUnitFromTopic(q.topic);
      return completedUnits.includes(topicUnit.toString());
    });

    // Select 10 random MCQs
    const selectedMCQs = shuffleArray(relevantMCQs).slice(0, 10);

    // Select 5 random FRQs
    const selectedFRQs = shuffleArray(relevantFRQs).slice(0, 5);

    // Create mixed question array
    const assessmentQuestions: AssessmentQuestion[] = [
      ...selectedMCQs.map(q => ({ type: 'mcq' as const, question: q })),
      ...selectedFRQs.map(q => ({ type: 'frq' as const, question: q })),
    ];

    // Shuffle to mix MCQs and FRQs
    setQuestions(shuffleArray(assessmentQuestions));
    setIsLoading(false);
  }, []);

  const currentQuestion = questions[currentIndex];
  const isMCQ = currentQuestion?.type === 'mcq';
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const saveAnswer = useCallback(() => {
    if (!currentQuestion) return;

    const newAnswer: Answer = {
      questionId: currentQuestion.question.id,
      type: currentQuestion.type,
      answer: isMCQ ? selectedAnswer : code,
    };

    if (isMCQ) {
      const mcq = currentQuestion.question as MCQQuestion;
      newAnswer.isCorrect = selectedAnswer === mcq.correctAnswer;
    }

    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === currentQuestion.question.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newAnswer;
        return updated;
      }
      return [...prev, newAnswer];
    });
  }, [currentQuestion, isMCQ, selectedAnswer, code]);

  const handleNext = () => {
    saveAnswer();

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      // Load existing answer if any
      const nextQuestion = questions[currentIndex + 1];
      const existingAnswer = answers.find(a => a.questionId === nextQuestion.question.id);
      if (existingAnswer) {
        if (nextQuestion.type === 'mcq') {
          setSelectedAnswer(existingAnswer.answer);
        } else {
          setCode(existingAnswer.answer || '');
        }
      } else {
        setSelectedAnswer(null);
        if (nextQuestion.type === 'frq') {
          setCode((nextQuestion.question as FRQQuestion).starterCode);
        }
      }
    } else {
      // Assessment complete
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      saveAnswer();
      setCurrentIndex(prev => prev - 1);
      // Load existing answer
      const prevQuestion = questions[currentIndex - 1];
      const existingAnswer = answers.find(a => a.questionId === prevQuestion.question.id);
      if (existingAnswer) {
        if (prevQuestion.type === 'mcq') {
          setSelectedAnswer(existingAnswer.answer);
        } else {
          setCode(existingAnswer.answer || '');
        }
      }
    }
  };

  // Initialize code when question changes
  useEffect(() => {
    if (currentQuestion && currentQuestion.type === 'frq') {
      const existingAnswer = answers.find(a => a.questionId === currentQuestion.question.id);
      if (existingAnswer) {
        setCode(existingAnswer.answer || '');
      } else {
        setCode((currentQuestion.question as FRQQuestion).starterCode);
      }
    }
  }, [currentIndex, currentQuestion, answers]);

  const calculateResults = () => {
    const mcqAnswers = answers.filter(a => a.type === 'mcq');
    const frqAnswers = answers.filter(a => a.type === 'frq');
    const correctMCQs = mcqAnswers.filter(a => a.isCorrect).length;
    const totalMCQs = questions.filter(q => q.type === 'mcq').length;
    const totalFRQs = questions.filter(q => q.type === 'frq').length;
    const frqsAttempted = frqAnswers.filter(a => a.answer && a.answer.trim().length > 50).length;

    return {
      correctMCQs,
      totalMCQs,
      frqsAttempted,
      totalFRQs,
      mcqPercentage: totalMCQs > 0 ? Math.round((correctMCQs / totalMCQs) * 100) : 0,
      overallScore: totalMCQs > 0 ? Math.round((correctMCQs / totalMCQs) * 100) : 0,
    };
  };

  const handleFinish = () => {
    // Save results to localStorage
    const results = calculateResults();
    localStorage.setItem('assessmentResults', JSON.stringify({
      ...results,
      timeElapsed,
      completedAt: new Date().toISOString(),
    }));
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg-hero flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-charcoal-light">Preparing your assessment...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const results = calculateResults();
    return (
      <div className="min-h-screen gradient-bg-hero flex items-center justify-center p-4">
        <Card className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-20 h-20 bg-success-light rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Trophy className="w-10 h-10 text-success" />
            </motion.div>

            <h1 className="text-2xl font-bold text-charcoal mb-2">Assessment Complete!</h1>
            <p className="text-charcoal-light mb-8">
              Great job! Here&apos;s how you did.
            </p>

            {/* Score Circle */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#E8E4DD"
                  strokeWidth="12"
                  fill="none"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#E07856"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: '0 352' }}
                  animate={{
                    strokeDasharray: `${(results.overallScore / 100) * 352} 352`,
                  }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-charcoal">
                  {results.overallScore}%
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-cream-100 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-primary-500" />
                  <span className="font-medium text-charcoal">MCQs</span>
                </div>
                <p className="text-2xl font-bold text-charcoal">
                  {results.correctMCQs}/{results.totalMCQs}
                </p>
                <p className="text-sm text-charcoal-light">Correct</p>
              </div>
              <div className="bg-cream-100 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <span className="font-medium text-charcoal">FRQs</span>
                </div>
                <p className="text-2xl font-bold text-charcoal">
                  {results.frqsAttempted}/{results.totalFRQs}
                </p>
                <p className="text-sm text-charcoal-light">Attempted</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-charcoal-light mb-8">
              <Clock className="w-4 h-4" />
              <span>Completed in {formatTime(timeElapsed)}</span>
            </div>

            <Button
              onClick={handleFinish}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-xl h-12"
            >
              Continue to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg-hero">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-charcoal-light text-sm">
              Question {currentIndex + 1} of {questions.length}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-full',
                  isMCQ
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                )}
              >
                {isMCQ ? 'Multiple Choice' : 'Free Response'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-charcoal-light">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatTime(timeElapsed)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-cream-300 rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-primary-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              {isMCQ ? (
                // MCQ Question
                <div>
                  <h2 className="text-lg font-medium text-charcoal mb-6">
                    {(currentQuestion.question as MCQQuestion).question}
                  </h2>

                  {(currentQuestion.question as MCQQuestion).codeBlock && (
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl mb-6 overflow-x-auto text-sm font-mono">
                      {(currentQuestion.question as MCQQuestion).codeBlock}
                    </pre>
                  )}

                  <div className="space-y-3">
                    {(currentQuestion.question as MCQQuestion).choices.map((choice) => (
                      <button
                        key={choice.label}
                        onClick={() => setSelectedAnswer(choice.label)}
                        className={cn(
                          'w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4',
                          selectedAnswer === choice.label
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-cream-300 hover:border-cream-400'
                        )}
                      >
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center font-bold',
                            selectedAnswer === choice.label
                              ? 'bg-primary-500 text-white'
                              : 'bg-cream-200 text-charcoal'
                          )}
                        >
                          {choice.label}
                        </div>
                        <span className="text-charcoal flex-1">{choice.text}</span>
                        {selectedAnswer === choice.label && (
                          <Check className="w-5 h-5 text-primary-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                // FRQ Question
                <div>
                  <h2 className="text-lg font-bold text-charcoal mb-2">
                    {(currentQuestion.question as FRQQuestion).title}
                  </h2>
                  <p className="text-charcoal-light mb-6 whitespace-pre-wrap">
                    {(currentQuestion.question as FRQQuestion).description}
                  </p>

                  <div className="h-[400px] rounded-xl overflow-hidden border border-cream-300">
                    <SimpleCodeEditor
                      value={code}
                      onChange={setCode}
                      language="java"
                    />
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="border-cream-300 text-charcoal hover:bg-white rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl"
          >
            {currentIndex === questions.length - 1 ? (
              <>
                Finish
                <Check className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Question Navigator */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {questions.map((_, index) => {
            const answer = answers.find(
              a => a.questionId === questions[index].question.id
            );
            const hasAnswer = answer && (answer.answer || answer.isCorrect !== undefined);

            return (
              <button
                key={index}
                onClick={() => {
                  saveAnswer();
                  setCurrentIndex(index);
                  const q = questions[index];
                  const existingAnswer = answers.find(a => a.questionId === q.question.id);
                  if (existingAnswer) {
                    if (q.type === 'mcq') {
                      setSelectedAnswer(existingAnswer.answer);
                    } else {
                      setCode(existingAnswer.answer || '');
                    }
                  } else {
                    setSelectedAnswer(null);
                    if (q.type === 'frq') {
                      setCode((q.question as FRQQuestion).starterCode);
                    }
                  }
                }}
                className={cn(
                  'w-8 h-8 rounded-lg text-sm font-medium transition-all',
                  index === currentIndex
                    ? 'bg-primary-500 text-white'
                    : hasAnswer
                    ? 'bg-success-light text-success-dark'
                    : 'bg-cream-200 text-charcoal hover:bg-cream-300'
                )}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Utility functions
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getUnitFromTopic(topic: string): number {
  const topicToUnit: Record<string, number> = {
    'primitive-types': 1,
    'variables': 1,
    'data-types': 1,
    'operators': 1,
    'using-objects': 2,
    'strings': 2,
    'wrapper-classes': 2,
    'math-class': 2,
    'boolean-expressions': 3,
    'if-statements': 3,
    'compound-boolean': 3,
    'iteration': 4,
    'while-loops': 4,
    'for-loops': 4,
    'nested-loops': 4,
    'writing-classes': 5,
    'constructors': 5,
    'methods': 5,
    'encapsulation': 5,
    'arrays': 6,
    'array-traversal': 6,
    'arraylist': 7,
    'arraylist-methods': 7,
    '2d-arrays': 8,
    '2d-array-traversal': 8,
    'inheritance': 9,
    'polymorphism': 9,
    'object-superclass': 9,
    'recursion': 10,
    'recursive-searching': 10,
    'recursive-sorting': 10,
  };
  return topicToUnit[topic] || 1;
}
