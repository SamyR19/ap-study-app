'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  PracticeHeader,
  QuestionDisplay,
  AnswerChoices,
  FeedbackPanel,
  Confetti,
} from '@/components/practice';
import { FRQFeedbackPanel } from '@/components/practice/FRQFeedbackPanel';
import { CodeEditor } from '@/components/CodeEditor';
import { ConsoleOutput } from '@/components/ConsoleOutput';
import { AP_CSA_TOPICS, getTopicById } from '@/data/topics';
import { Send, SkipForward, Lock, FileCode, List, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock MCQ data - in production, fetch from Supabase
const mockMCQs = [
  {
    id: '1',
    questionText: 'What is the output of the following code snippet?',
    codeSnippet: `int[] arr = {1, 2, 3, 4, 5};
for (int i = arr.length - 1; i >= 0; i--) {
    System.out.print(arr[i] + " ");
}`,
    choices: [
      { index: 0, text: '1 2 3 4 5' },
      { index: 1, text: '5 4 3 2 1' },
      { index: 2, text: 'ArrayIndexOutOfBoundsException' },
      { index: 3, text: '5 4 3 2 1 0' },
    ],
    correctAnswerIndex: 1,
    explanation: 'The loop starts at the last index (arr.length - 1 = 4) and decrements down to 0, printing each element. This results in the array being printed in reverse order: 5 4 3 2 1.',
    difficulty: 'medium' as const,
  },
  {
    id: '2',
    questionText: 'Which of the following correctly declares and initializes a 2D array with 3 rows and 4 columns?',
    choices: [
      { index: 0, text: 'int[][] arr = new int[4][3];' },
      { index: 1, text: 'int[][] arr = new int[3][4];' },
      { index: 2, text: 'int[3][4] arr = new int[][];' },
      { index: 3, text: 'int arr[][] = new int[3,4];' },
    ],
    correctAnswerIndex: 1,
    explanation: 'In Java, when declaring a 2D array, the first dimension represents rows and the second represents columns. So int[][] arr = new int[3][4] creates an array with 3 rows and 4 columns.',
    difficulty: 'easy' as const,
  },
  {
    id: '3',
    questionText: 'What happens when you try to access an array element with an index that is out of bounds?',
    choices: [
      { index: 0, text: 'The program returns null' },
      { index: 1, text: 'The program returns 0' },
      { index: 2, text: 'An ArrayIndexOutOfBoundsException is thrown' },
      { index: 3, text: 'The program continues with undefined behavior' },
    ],
    correctAnswerIndex: 2,
    explanation: 'Java performs bounds checking on all array accesses. If you try to access an index less than 0 or greater than or equal to the array length, Java throws an ArrayIndexOutOfBoundsException at runtime.',
    difficulty: 'easy' as const,
  },
];

// Mock FRQ data
const mockFRQ = {
  id: 'frq-1',
  title: 'Array Sum Calculator',
  prompt: `Write a method called sumArray that takes an array of integers as a parameter and returns the sum of all elements in the array.

Requirements:
- The method should be public and static
- It should return an int
- It should handle empty arrays (return 0)
- Use a standard for loop (not enhanced for loop)`,
  starterCode: `public class ArrayUtils {
    /**
     * Returns the sum of all elements in the array.
     * @param arr the array of integers to sum
     * @return the sum of all elements, or 0 if array is empty
     */
    public static int sumArray(int[] arr) {
        // Your code here

    }

    // Test your method
    public static void main(String[] args) {
        int[] test1 = {1, 2, 3, 4, 5};
        System.out.println(sumArray(test1)); // Expected: 15

        int[] test2 = {};
        System.out.println(sumArray(test2)); // Expected: 0

        int[] test3 = {-1, 5, -3, 2};
        System.out.println(sumArray(test3)); // Expected: 3
    }
}`,
  rubric: [
    {
      id: 'loop',
      description: 'Loop Structure',
      points: 3,
      criteria: [
        'Uses a standard for loop',
        'Correctly initializes loop variable',
        'Uses correct termination condition (i < arr.length)',
        'Properly increments loop variable',
      ],
    },
    {
      id: 'accumulator',
      description: 'Accumulator Pattern',
      points: 3,
      criteria: [
        'Declares a sum variable initialized to 0',
        'Adds each element to the sum inside the loop',
        'Returns the sum after the loop',
      ],
    },
    {
      id: 'edge-cases',
      description: 'Edge Case Handling',
      points: 2,
      criteria: [
        'Handles empty array correctly',
        'Works with negative numbers',
      ],
    },
    {
      id: 'syntax',
      description: 'Syntax and Style',
      points: 1,
      criteria: [
        'Correct method signature',
        'No compilation errors',
      ],
    },
  ],
  maxPoints: 9,
  testCases: [
    { id: 'tc1', input: '', expectedOutput: '15\n0\n3', description: 'All test cases pass', isHidden: false },
  ],
  difficulty: 'easy' as 'easy' | 'medium' | 'hard',
};

type PracticeMode = 'mcq' | 'frq';

interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  expected?: string;
  actual?: string;
  isHidden?: boolean;
}

export default function PracticePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const topicId = params.topicId as string;
  const mode = (searchParams.get('mode') as PracticeMode) || 'mcq';

  // Topic info
  const topic = getTopicById(topicId) || AP_CSA_TOPICS[0];

  // MCQ State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // FRQ State
  const [code, setCode] = useState(mockFRQ.starterCode);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [consoleError, setConsoleError] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [frqFeedback, setFrqFeedback] = useState<{
    score: number;
    maxScore: number;
    rubricScores: Array<{
      id: string;
      name: string;
      pointsEarned: number;
      pointsPossible: number;
      feedback: string;
      criteria: Array<{ description: string; met: boolean }>;
    }>;
    strengths?: string[];
    improvements?: string[];
    commonMistakes?: string[];
  } | null>(null);
  const [showRubric, setShowRubric] = useState(false);
  const [isSaved, setIsSaved] = useState(true);

  const questions = mockMCQs;
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = mode === 'mcq' ? questions.length : 1;

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // MCQ Handlers
  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setIsSubmitted(true);

    if (selectedAnswer === currentQuestion.correctAnswerIndex) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleReview = () => {
    // Could implement review functionality
    console.log('Review question');
  };

  // FRQ Handlers
  const handleRunCode = async (codeToRun: string) => {
    setIsRunning(true);
    setConsoleOutput('');
    setConsoleError('');
    setTestResults([]);

    try {
      const response = await fetch('/api/execute-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeToRun,
          language: 'java',
        }),
      });

      const data = await response.json();

      if (data.error) {
        setConsoleError(data.error);
      } else {
        setConsoleOutput(data.output || '');
        if (data.testResults) {
          setTestResults(data.testResults);
        }
      }
    } catch {
      setConsoleError('Failed to execute code. Please try again.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetCode = () => {
    setCode(mockFRQ.starterCode);
    setConsoleOutput('');
    setConsoleError('');
    setTestResults([]);
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setIsSaved(false);
    // Auto-save after 2 seconds of no typing
    setTimeout(() => setIsSaved(true), 2000);
  };

  const handleClearConsole = () => {
    setConsoleOutput('');
    setConsoleError('');
    setTestResults([]);
  };

  const handleSubmitFRQ = async () => {
    setIsGrading(true);

    try {
      const response = await fetch('/api/grade-frq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: 'java',
          prompt: mockFRQ.prompt,
          rubric: mockFRQ.rubric,
          maxPoints: mockFRQ.maxPoints,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setConsoleError(data.error);
      } else {
        setFrqFeedback(data);
      }
    } catch {
      setConsoleError('Failed to grade submission. Please try again.');
    } finally {
      setIsGrading(false);
    }
  };

  const handleTryAgain = () => {
    setFrqFeedback(null);
  };

  const handleNextFRQ = () => {
    // Navigate to next FRQ or back to topic
    console.log('Next FRQ');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'frq') return; // Different shortcuts for FRQ

      // Prevent shortcuts when typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toUpperCase();
      const choicesLength = currentQuestion?.choices?.length || 0;

      // A, B, C, D, E to select answer
      if (!isSubmitted && ['A', 'B', 'C', 'D', 'E'].includes(key)) {
        const index = key.charCodeAt(0) - 65;
        if (index < choicesLength) {
          setSelectedAnswer(index);
        }
      }

      // Enter to submit
      if (key === 'ENTER' && selectedAnswer !== null && !isSubmitted) {
        setIsSubmitted(true);
        if (selectedAnswer === currentQuestion?.correctAnswerIndex) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2000);
        }
      }

      // N for next question
      if (key === 'N' && isSubmitted && currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsSubmitted(false);
      }

      // S to skip
      if (key === 'S' && !isSubmitted && currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsSubmitted(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, selectedAnswer, isSubmitted, currentQuestionIndex, currentQuestion, questions.length]);

  // Render MCQ Mode
  if (mode === 'mcq') {
    return (
      <div className="min-h-screen bg-cream-50">
        <Confetti show={showConfetti} />

        <PracticeHeader
          topicName={topic.name}
          topicIcon={topic.icon}
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
          timeElapsed={timeElapsed}
          showTimer
        />

        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Question Side */}
            <div>
              <QuestionDisplay
                questionNumber={currentQuestionIndex + 1}
                questionText={currentQuestion.questionText}
                codeSnippet={currentQuestion.codeSnippet}
                difficulty={currentQuestion.difficulty}
              />
            </div>

            {/* Answer Side */}
            <div className="space-y-6">
              <AnswerChoices
                choices={currentQuestion.choices}
                selectedIndex={selectedAnswer}
                correctIndex={isSubmitted ? currentQuestion.correctAnswerIndex : undefined}
                isSubmitted={isSubmitted}
                onSelect={setSelectedAnswer}
              />

              {/* Action Buttons */}
              {!isSubmitted && (
                <div className="flex gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white rounded-xl h-12 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Answer
                  </Button>
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    className="border-cream-400 hover:bg-cream-100 rounded-xl h-12"
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Skip
                  </Button>
                  <Button
                    variant="outline"
                    className="border-cream-400 hover:bg-cream-100 rounded-xl h-12"
                    disabled
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Hint
                  </Button>
                </div>
              )}

              {/* Feedback Panel */}
              <AnimatePresence>
                {isSubmitted && (
                  <FeedbackPanel
                    isCorrect={selectedAnswer === currentQuestion.correctAnswerIndex}
                    explanation={currentQuestion.explanation}
                    onNext={handleNext}
                    onReview={handleReview}
                  />
                )}
              </AnimatePresence>

              {/* Keyboard Shortcuts Hint */}
              <div className="text-xs text-charcoal-light text-center space-x-4">
                <span>
                  <kbd className="px-1.5 py-0.5 bg-cream-200 rounded text-charcoal">A-E</kbd> Select
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-cream-200 rounded text-charcoal">Enter</kbd> Submit
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-cream-200 rounded text-charcoal">N</kbd> Next
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-cream-200 rounded text-charcoal">S</kbd> Skip
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render FRQ Mode
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <PracticeHeader
        topicName={topic.name}
        topicIcon={topic.icon}
        currentQuestion={1}
        totalQuestions={1}
        timeElapsed={timeElapsed}
        showTimer
      />

      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 py-6">
        {/* FRQ Feedback Overlay */}
        <AnimatePresence>
          {frqFeedback && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 overflow-auto"
            >
              <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
                <FRQFeedbackPanel
                  score={frqFeedback.score}
                  maxScore={frqFeedback.maxScore}
                  rubricScores={frqFeedback.rubricScores}
                  strengths={frqFeedback.strengths || []}
                  improvements={frqFeedback.improvements || []}
                  commonMistakes={frqFeedback.commonMistakes || []}
                  onTryAgain={handleTryAgain}
                  onNext={handleNextFRQ}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grading Overlay */}
        {isGrading && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
              <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-charcoal mb-2">Grading Your Submission</h3>
              <p className="text-charcoal-light">Our AI is reviewing your code...</p>
            </div>
          </div>
        )}

        {/* Question Panel */}
        <Card className="border-cream-300 mb-6">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-charcoal">{mockFRQ.title}</h2>
                  <Badge className="bg-amber-100 text-amber-700 border-0">
                    {mockFRQ.maxPoints} points
                  </Badge>
                </div>
                <Badge
                  className={cn(
                    'border-0',
                    mockFRQ.difficulty === 'easy' && 'bg-success-light text-success-dark',
                    mockFRQ.difficulty === 'medium' && 'bg-amber-100 text-amber-700',
                    mockFRQ.difficulty === 'hard' && 'bg-red-100 text-red-700'
                  )}
                >
                  {mockFRQ.difficulty.charAt(0).toUpperCase() + mockFRQ.difficulty.slice(1)}
                </Badge>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowRubric(!showRubric)}
                className="border-cream-300 hover:bg-cream-100"
              >
                <List className="w-4 h-4 mr-2" />
                {showRubric ? 'Hide' : 'View'} Rubric
              </Button>
            </div>

            <div className="prose prose-charcoal max-w-none">
              <p className="whitespace-pre-wrap text-charcoal-light">{mockFRQ.prompt}</p>
            </div>

            {/* Rubric Preview */}
            <AnimatePresence>
              {showRubric && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="bg-cream-50 rounded-xl p-4 border border-cream-300">
                    <h4 className="font-semibold text-charcoal mb-3">Grading Rubric</h4>
                    <div className="space-y-3">
                      {mockFRQ.rubric.map((item) => (
                        <div key={item.id} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                            {item.points}
                          </div>
                          <div>
                            <p className="font-medium text-charcoal text-sm">{item.description}</p>
                            <ul className="mt-1 text-xs text-charcoal-light space-y-0.5">
                              {item.criteria.map((c, idx) => (
                                <li key={idx}>• {c}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>

        {/* Code Editor and Console */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Editor */}
          <div className="min-h-[500px]">
            <CodeEditor
              initialCode={mockFRQ.starterCode}
              language="java"
              onRun={handleRunCode}
              onReset={handleResetCode}
              onCodeChange={handleCodeChange}
              isRunning={isRunning}
              isSaved={isSaved}
              className="h-full"
            />
          </div>

          {/* Console */}
          <div className="min-h-[500px]">
            <ConsoleOutput
              output={consoleOutput}
              error={consoleError}
              testResults={testResults}
              isRunning={isRunning}
              onClear={handleClearConsole}
            />
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between bg-white rounded-xl border border-cream-300 p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-cream-300 hover:bg-cream-100 rounded-xl"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Skip Question
            </Button>
          </div>
          <Button
            onClick={handleSubmitFRQ}
            disabled={isGrading}
            className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl h-12 px-8"
          >
            <FileCode className="w-4 h-4 mr-2" />
            Submit for Grading
          </Button>
        </div>
      </div>
    </div>
  );
}
