'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Play,
  Clock,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trophy,
  RotateCcw,
  Copy,
  Terminal,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PracticeTest, PracticeTestQuestion, PracticeTestAnswer } from '@/types/study-tools';
import Editor from '@monaco-editor/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';

type Mode = 'preview' | 'taking' | 'results';

// Code block component for displaying code in questions
const CodeBlock = ({ language, children }: { language: string; children: string }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-cream-200 bg-cream-50/50">
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs text-charcoal-light font-medium">{language || 'code'}</span>
        <button
          onClick={copyCode}
          className="p-1.5 rounded-md hover:bg-cream-200/50 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-charcoal-light" />
          )}
        </button>
      </div>
      <div className="px-4 pb-4 overflow-x-auto">
        <SyntaxHighlighter
          language={language || 'java'}
          style={oneLight}
          showLineNumbers={false}
          wrapLines={false}
          customStyle={{
            margin: 0,
            padding: 0,
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: '1.7',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            },
          }}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

// Parse question text to separate text and code blocks
const parseQuestionContent = (text: string): { type: 'text' | 'code'; content: string; language?: string }[] => {
  const parts: { type: 'text' | 'code'; content: string; language?: string }[] = [];
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const textContent = text.slice(lastIndex, match.index).trim();
      if (textContent) {
        parts.push({ type: 'text', content: textContent });
      }
    }

    // Add code block
    parts.push({
      type: 'code',
      content: match[2].trim(),
      language: match[1] || 'java',
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const textContent = text.slice(lastIndex).trim();
    if (textContent) {
      parts.push({ type: 'text', content: textContent });
    }
  }

  // If no code blocks found, return original text
  if (parts.length === 0) {
    parts.push({ type: 'text', content: text });
  }

  return parts;
};

export default function PracticeTestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const testId = params.id as string;
  const autoStart = searchParams.get('start') === 'true';

  const [test, setTest] = useState<PracticeTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<Mode>(autoStart ? 'taking' : 'preview');

  // Test taking state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, PracticeTestAnswer>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Results state
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);

  // Code execution state
  const [showOutputModal, setShowOutputModal] = useState(false);
  const [codeOutput, setCodeOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [outputError, setOutputError] = useState<string | null>(null);

  useEffect(() => {
    loadTestData();
  }, [testId]);

  useEffect(() => {
    // Start timer if test has time limit
    if (mode === 'taking' && test?.settings?.timerMinutes && timeRemaining === null) {
      setTimeRemaining(test.settings.timerMinutes * 60);
    }

    if (mode === 'taking' && timeRemaining !== null && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [mode, test]);

  const loadTestData = async () => {
    try {
      const { data, error } = await supabase
        .from('practice_tests')
        .select('*')
        .eq('id', testId)
        .single();

      if (error) throw error;
      setTest(data);
    } catch (error) {
      console.error('Error loading practice test:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startTest = () => {
    setCurrentIndex(0);
    setAnswers(new Map());
    setTimeRemaining(test?.settings?.timerMinutes ? test.settings.timerMinutes * 60 : null);
    setMode('taking');
  };

  const handleMCQAnswer = (choiceIndex: number) => {
    const question = test!.questions[currentIndex];
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.set(currentIndex, {
        questionIndex: currentIndex,
        answer: choiceIndex,
        isCorrect: question.correctAnswerIndex === choiceIndex,
        pointsEarned: question.correctAnswerIndex === choiceIndex ? 1 : 0,
      });
      return newAnswers;
    });
  };

  const handleFRQAnswer = (text: string) => {
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.set(currentIndex, {
        questionIndex: currentIndex,
        answer: text,
      });
      return newAnswers;
    });
  };

  const runCode = async () => {
    const answer = answers.get(currentIndex);
    const code = typeof answer?.answer === 'string' ? answer.answer : '';

    if (!code.trim()) {
      setOutputError('No code to run');
      setShowOutputModal(true);
      return;
    }

    setIsRunning(true);
    setCodeOutput('');
    setOutputError(null);
    setShowOutputModal(true);

    try {
      const response = await fetch('/api/execute-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: 'java',
        }),
      });

      const data = await response.json();

      if (data.error) {
        setOutputError(data.error);
      } else {
        setCodeOutput(data.output || 'No output');
      }
    } catch {
      setOutputError('Failed to execute code. Please try again.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Calculate score
    let totalScore = 0;
    let totalMax = 0;

    test!.questions.forEach((question, index) => {
      const answer = answers.get(index);
      if (question.type === 'mcq') {
        totalMax += 1;
        if (answer?.isCorrect) {
          totalScore += 1;
        }
      } else if (question.type === 'frq') {
        const maxPoints = question.rubric?.reduce((sum, item) => sum + item.points, 0) || 5;
        totalMax += maxPoints;
        // For FRQ, we give partial credit based on answer length (simplified)
        if (answer?.answer && typeof answer.answer === 'string' && answer.answer.length > 50) {
          totalScore += Math.floor(maxPoints * 0.7); // 70% for attempting
        }
      }
    });

    setScore(totalScore);
    setMaxScore(totalMax);
    setMode('results');

    // Save attempt to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('practice_test_attempts').insert({
          user_id: user.id,
          test_id: testId,
          answers: Array.from(answers.values()),
          score: totalScore,
          max_score: totalMax,
          time_taken_seconds: test?.settings?.timerMinutes
            ? (test.settings.timerMinutes * 60) - (timeRemaining || 0)
            : null,
          completed_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error saving attempt:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="text-center py-16">
        <p className="text-charcoal-light">Practice test not found</p>
      </div>
    );
  }

  const questions: PracticeTestQuestion[] = test.questions || [];
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers.get(currentIndex);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => mode === 'taking' ? setMode('preview') : router.push('/library/practice-tests')}
            className="p-2 rounded-lg hover:bg-cream-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-charcoal" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-charcoal">{test.title}</h1>
            <p className="text-charcoal-light">
              {questions.length} questions
              {test.settings?.timerMinutes && ` • ${test.settings.timerMinutes} minutes`}
            </p>
          </div>
        </div>

        {mode === 'taking' && timeRemaining !== null && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
            timeRemaining < 60 ? 'bg-red-100 text-red-600' : 'bg-cream-100 text-charcoal'
          }`}>
            <Clock className="w-5 h-5" />
            <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>

      {/* Preview Mode */}
      {mode === 'preview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-cream-200 p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Play className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-charcoal mb-2">Ready to start?</h2>
            <p className="text-charcoal-light mb-6">
              This test has {questions.length} questions.
              {test.settings?.timerMinutes && ` You'll have ${test.settings.timerMinutes} minutes to complete it.`}
            </p>
            <button
              onClick={startTest}
              className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors"
            >
              <Play className="w-5 h-5" />
              Start Test
            </button>
          </div>

          {/* Question Preview */}
          <div className="bg-white rounded-xl border border-cream-200 overflow-hidden">
            <div className="p-4 border-b border-cream-200">
              <h3 className="font-semibold text-charcoal">Questions Overview</h3>
            </div>
            <div className="divide-y divide-cream-100">
              {questions.map((q, index) => (
                <div key={q.id} className="p-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center text-sm font-medium text-charcoal">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-charcoal truncate">{q.question}</p>
                    <p className="text-sm text-charcoal-light">
                      {q.type === 'mcq' ? 'Multiple Choice' : 'Free Response'} • {q.difficulty}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Taking Mode */}
      {mode === 'taking' && currentQuestion && (
        <div className="space-y-6">
          {/* Progress */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-cream-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-charcoal transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-charcoal-light">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>

          {/* Question */}
          <div className="bg-white rounded-xl border border-cream-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                currentQuestion.type === 'mcq'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-purple-100 text-purple-600'
              }`}>
                {currentQuestion.type === 'mcq' ? 'Multiple Choice' : 'Free Response'}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                currentQuestion.difficulty === 'easy'
                  ? 'bg-green-100 text-green-600'
                  : currentQuestion.difficulty === 'hard'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-amber-100 text-amber-600'
              }`}>
                {currentQuestion.difficulty}
              </span>
            </div>

            {/* Question Content with Code Blocks */}
            <div className="mb-6">
              {parseQuestionContent(currentQuestion.question).map((part, idx) => (
                part.type === 'text' ? (
                  <p key={idx} className="text-lg text-charcoal">{part.content}</p>
                ) : (
                  <CodeBlock key={idx} language={part.language || 'java'}>
                    {part.content}
                  </CodeBlock>
                )
              ))}
            </div>

            {/* MCQ Choices */}
            {currentQuestion.type === 'mcq' && currentQuestion.choices && (
              <div className="space-y-3">
                {currentQuestion.choices.map((choice) => {
                  const choiceParts = parseQuestionContent(choice.text);
                  const hasCode = choiceParts.some(p => p.type === 'code');

                  return (
                    <button
                      key={choice.index}
                      onClick={() => handleMCQAnswer(choice.index)}
                      className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
                        currentAnswer?.answer === choice.index
                          ? 'border-charcoal bg-cream-100'
                          : 'border-cream-200 hover:border-charcoal-light'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium flex-shrink-0 ${
                        currentAnswer?.answer === choice.index
                          ? 'bg-charcoal text-white'
                          : 'bg-cream-100 text-charcoal'
                      }`}>
                        {String.fromCharCode(65 + choice.index)}
                      </span>
                      <div className="flex-1 min-w-0">
                        {hasCode ? (
                          choiceParts.map((part, pIdx) => (
                            part.type === 'text' ? (
                              <span key={pIdx} className="text-charcoal">{part.content}</span>
                            ) : (
                              <code
                                key={pIdx}
                                className="block bg-cream-50 px-3 py-2 rounded-lg font-mono text-sm mt-2 overflow-x-auto"
                              >
                                {part.content}
                              </code>
                            )
                          ))
                        ) : (
                          <span className="text-charcoal">{choice.text}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* FRQ Code Editor */}
            {currentQuestion.type === 'frq' && (
              <div className="space-y-4">
                <div className="border border-cream-200 rounded-xl overflow-hidden">
                  <div className="bg-cream-50 px-4 py-2 border-b border-cream-200 flex items-center justify-between">
                    <span className="text-sm font-medium text-charcoal">Java</span>
                    <button
                      onClick={runCode}
                      disabled={isRunning}
                      className="flex items-center gap-2 px-3 py-1.5 bg-charcoal text-white rounded-lg text-sm font-medium hover:bg-charcoal/90 transition-colors disabled:opacity-50"
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Run
                        </>
                      )}
                    </button>
                  </div>
                  <Editor
                    height="300px"
                    defaultLanguage="java"
                    value={typeof currentAnswer?.answer === 'string' ? currentAnswer.answer : ''}
                    onChange={(value) => handleFRQAnswer(value || '')}
                    theme="vs-light"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 4,
                      wordWrap: 'on',
                      padding: { top: 16, bottom: 16 },
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cream-100 text-charcoal hover:bg-cream-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
              >
                Submit Test
                <Check className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-xl hover:bg-charcoal/90 transition-colors"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Mode */}
      {mode === 'results' && (
        <div className="space-y-6">
          {/* Score Summary */}
          <div className="bg-white rounded-xl border border-cream-200 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-primary-500" />
            </div>
            <h2 className="text-2xl font-bold text-charcoal mb-2">Test Complete!</h2>
            <p className="text-4xl font-bold text-charcoal mb-1">
              {score} / {maxScore}
            </p>
            <p className="text-charcoal-light mb-6">
              {Math.round((score / maxScore) * 100)}% correct
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={startTest}
                className="flex items-center gap-2 px-4 py-2 bg-cream-100 text-charcoal rounded-xl hover:bg-cream-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Test
              </button>
              <button
                onClick={() => router.push('/library/practice-tests')}
                className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-xl hover:bg-charcoal/90 transition-colors"
              >
                Back to Tests
              </button>
            </div>
          </div>

          {/* Question Review */}
          <div className="bg-white rounded-xl border border-cream-200 overflow-hidden">
            <div className="p-4 border-b border-cream-200">
              <h3 className="font-semibold text-charcoal">Review Answers</h3>
            </div>
            <div className="divide-y divide-cream-100">
              {questions.map((q, index) => {
                const answer = answers.get(index);
                const isCorrect = q.type === 'mcq' && answer?.isCorrect;
                const questionParts = parseQuestionContent(q.question);

                return (
                  <div key={q.id} className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        q.type === 'mcq'
                          ? isCorrect
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                          : 'bg-cream-100 text-charcoal'
                      }`}>
                        {q.type === 'mcq' ? (
                          isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <div className="flex-1">
                        {/* Question with code blocks */}
                        <div className="mb-2">
                          {questionParts.map((part, pIdx) => (
                            part.type === 'text' ? (
                              <p key={pIdx} className="text-charcoal font-medium">{part.content}</p>
                            ) : (
                              <CodeBlock key={pIdx} language={part.language || 'java'}>
                                {part.content}
                              </CodeBlock>
                            )
                          ))}
                        </div>

                        {q.type === 'mcq' && (
                          <div className="space-y-1 text-sm">
                            <p className="text-charcoal-light">
                              Your answer: {answer?.answer !== undefined
                                ? q.choices?.[answer.answer as number]?.text || 'Not answered'
                                : 'Not answered'}
                            </p>
                            {!isCorrect && (
                              <p className="text-green-600">
                                Correct answer: {q.choices?.[q.correctAnswerIndex!]?.text}
                              </p>
                            )}
                          </div>
                        )}

                        {q.type === 'frq' && answer?.answer && (
                          <div className="bg-cream-50 rounded-xl border border-cream-200 overflow-hidden">
                            <div className="bg-cream-100 px-4 py-2 border-b border-cream-200">
                              <span className="text-xs font-medium text-charcoal-light">Your Code</span>
                            </div>
                            <pre className="p-4 text-sm font-mono overflow-x-auto">
                              {answer.answer as string}
                            </pre>
                          </div>
                        )}

                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-600 mb-1">Explanation:</p>
                          <p className="text-sm text-blue-800">{q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Code Output Modal */}
      <AnimatePresence>
        {showOutputModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOutputModal(false)}
              className="absolute inset-0 bg-black/30"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-charcoal" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal">Output</h3>
                    <p className="text-sm text-charcoal-light">
                      {isRunning ? 'Running code...' : 'Execution result'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOutputModal(false)}
                  className="p-2 rounded-lg hover:bg-cream-100 transition-colors"
                >
                  <X className="w-5 h-5 text-charcoal-light" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {isRunning ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-charcoal-light" />
                  </div>
                ) : outputError ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-sm font-medium text-red-600 mb-1">Error</p>
                    <pre className="text-sm text-red-700 font-mono whitespace-pre-wrap">
                      {outputError}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-cream-50 border border-cream-200 rounded-xl p-4">
                    <pre className="text-sm text-charcoal font-mono whitespace-pre-wrap">
                      {codeOutput || 'No output'}
                    </pre>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-cream-200 flex justify-end">
                <button
                  onClick={() => setShowOutputModal(false)}
                  className="px-4 py-2 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
