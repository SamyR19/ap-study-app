'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import {
  X,
  Loader2,
  Trophy,
  Users,
  Check,
  Crown,
  Medal,
  Zap,
  Clock,
  Play,
  Code,
  AlertCircle,
} from 'lucide-react';
import { useQuizRealtime, useSaveQuizResult } from '@/lib/use-quiz-realtime';

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseKey);
};

interface MCQQuestion {
  type: 'mcq';
  id: string;
  question: string;
  choices: { index: number; text: string }[];
  correctAnswerIndex: number;
}

interface FRQQuestion {
  type: 'frq';
  id: string;
  question: string;
  starterCode: string;
  language: string;
  testCases: { input: string; expectedOutput: string }[];
  hints?: string[];
}

type QuizQuestion = MCQQuestion | FRQQuestion;

interface Participant {
  id: string;
  username: string;
  avatarColor: string;
  score: number;
  currentAnswer: number | string | null;
  hasAnswered: boolean;
  isCorrect: boolean | null;
  streak: number;
}

type QuizPhase = 'loading' | 'generating' | 'waiting' | 'question' | 'leaderboard' | 'final' | 'error';

export default function LiveQuizPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = params.groupId as string;
  const quizId = params.quizId as string;

  // Get quiz config from URL params
  const configFromUrl = {
    sourceType: searchParams.get('source') || 'ai',
    prompt: searchParams.get('prompt') || '',
    flashcardSetId: searchParams.get('setId') || '',
    questionCount: parseInt(searchParams.get('count') || '10'),
    timePerQuestion: parseInt(searchParams.get('time') || '15'),
    frqTimeLimit: parseInt(searchParams.get('frqTime') || '300'),
    pointsPerQuestion: parseInt(searchParams.get('points') || '100'),
    speedBonus: searchParams.get('speedBonus') !== 'false',
    questionTypes: (searchParams.get('types') || 'mcq').split(',') as ('mcq' | 'frq')[],
    units: searchParams.get('units') || '',
  };

  const [, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading quiz...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  const [phase, setPhase] = useState<QuizPhase>('loading');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(configFromUrl.timePerQuestion);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [userScore, setUserScore] = useState(0);
  const [leaderboardCountdown, setLeaderboardCountdown] = useState(5);
  const [streak, setStreak] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // FRQ state
  const [frqCode, setFrqCode] = useState('');
  const [frqOutput, setFrqOutput] = useState<string | null>(null);
  const [frqTestResults, setFrqTestResults] = useState<{ passed: boolean; input: string; expected: string; actual: string }[] | null>(null);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [frqError, setFrqError] = useState<string | null>(null);

  // Quiz configuration from URL
  const [quizConfig] = useState({
    timePerQuestion: configFromUrl.timePerQuestion,
    frqTimeLimit: configFromUrl.frqTimeLimit,
    pointsPerQuestion: configFromUrl.pointsPerQuestion,
    speedBonus: configFromUrl.speedBonus,
    showLeaderboardFor: 5,
  });

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isFRQ = currentQuestion?.type === 'frq';

  const avatarColors = ['bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-yellow-400', 'bg-red-400'];

  // Realtime sync for multiplayer
  const {
    isConnected: realtimeConnected,
    submitAnswer: realtimeSubmitAnswer,
    broadcastShowLeaderboard,
    broadcastNextQuestion,
    broadcastQuizEnd,
  } = useQuizRealtime({
    quizId,
    groupId,
    userId: currentUser?.id || '',
    username: currentUser?.username || '',
    onParticipantJoin: (participant) => {
      if (realtimeEnabled) {
        setParticipants(prev => {
          if (prev.find(p => p.id === participant.id)) return prev;
          return [...prev, participant];
        });
      }
    },
    onParticipantLeave: (participantId) => {
      if (realtimeEnabled) {
        setParticipants(prev => prev.filter(p => p.id !== participantId));
      }
    },
    onAnswerSubmitted: (participantId, answer) => {
      if (realtimeEnabled) {
        setParticipants(prev =>
          prev.map(p =>
            p.id === participantId
              ? { ...p, currentAnswer: answer, hasAnswered: true }
              : p
          )
        );
      }
    },
  });

  // Save quiz results hook
  const { saveResult } = useSaveQuizResult();

  useEffect(() => {
    loadQuizData();
  }, []);

  // Reset FRQ state when question changes
  useEffect(() => {
    if (currentQuestion) {
      if (isFRQ) {
        const frq = currentQuestion as FRQQuestion;
        setFrqCode(frq.starterCode);
        setFrqOutput(null);
        setFrqTestResults(null);
        setFrqError(null);
        setTimeLeft(quizConfig.frqTimeLimit);
      } else {
        setTimeLeft(quizConfig.timePerQuestion);
      }
    }
  }, [currentQuestionIndex, isFRQ, currentQuestion]);

  // Question timer
  useEffect(() => {
    if (phase !== 'question' || !currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, currentQuestionIndex, currentQuestion]);

  // Leaderboard countdown
  useEffect(() => {
    if (phase !== 'leaderboard') return;

    const timer = setInterval(() => {
      setLeaderboardCountdown(prev => {
        if (prev <= 1) {
          goToNextQuestion();
          return quizConfig.showLeaderboardFor;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  const loadQuizData = async () => {
    try {
      setPhase('loading');
      setLoadingMessage('Authenticating...');

      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      const username = profileData?.username || 'You';
      setCurrentUser({ id: user.id, username });

      // Enable realtime after user is loaded
      setRealtimeEnabled(true);

      // Initialize with just the current user (no bots)
      const userParticipant: Participant = {
        id: user.id,
        username,
        avatarColor: avatarColors[0],
        score: 0,
        currentAnswer: null,
        hasAnswered: false,
        isCorrect: null,
        streak: 0,
      };
      setParticipants([userParticipant]);

      // Generate questions
      setPhase('generating');
      setLoadingMessage('Generating quiz questions with AI...');

      let flashcardContent = '';
      if (configFromUrl.sourceType === 'flashcards' && configFromUrl.flashcardSetId) {
        // Fetch flashcard content
        const { data: flashcards } = await supabase
          .from('flashcards')
          .select('front, back')
          .eq('set_id', configFromUrl.flashcardSetId);

        if (flashcards && flashcards.length > 0) {
          flashcardContent = flashcards
            .map(f => `Term: ${f.front}\nDefinition: ${f.back}`)
            .join('\n\n');
        }
      }

      const response = await fetch('/api/generate-quiz-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: configFromUrl.sourceType,
          prompt: configFromUrl.prompt,
          flashcardContent,
          questionCount: configFromUrl.questionCount,
          questionTypes: configFromUrl.questionTypes,
          units: configFromUrl.units,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate questions');
      }

      const data = await response.json();

      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions were generated');
      }

      setQuestions(data.questions);
      setLoadingMessage('Starting quiz...');

      // Start the quiz
      setTimeout(() => {
        setPhase('question');
        setTimeLeft(data.questions[0]?.type === 'frq' ? quizConfig.frqTimeLimit : quizConfig.timePerQuestion);
      }, 1000);

    } catch (err) {
      console.error('Error loading quiz:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load quiz');
      setPhase('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeUp = useCallback(() => {
    if (hasAnswered) return;

    setHasAnswered(true);
    setStreak(0);

    setTimeout(() => {
      setPhase('leaderboard');
      setLeaderboardCountdown(quizConfig.showLeaderboardFor);
    }, 1500);
  }, [hasAnswered, quizConfig.showLeaderboardFor]);

  const handleMCQAnswer = (answerIndex: number) => {
    if (hasAnswered || phase !== 'question' || isFRQ) return;

    setSelectedAnswer(answerIndex);
    setHasAnswered(true);

    const mcq = currentQuestion as MCQQuestion;
    const isCorrect = answerIndex === mcq.correctAnswerIndex;

    let points = 0;
    if (isCorrect) {
      const basePoints = quizConfig.pointsPerQuestion;
      const speedBonus = quizConfig.speedBonus
        ? Math.floor((timeLeft / quizConfig.timePerQuestion) * basePoints * 0.5)
        : 0;
      const streakBonus = streak > 0 ? Math.min(streak * 10, 50) : 0;
      points = basePoints + speedBonus + streakBonus;
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    setUserScore(prev => prev + points);

    setParticipants(prev =>
      prev.map(p =>
        p.id === currentUser?.id
          ? { ...p, score: p.score + points, currentAnswer: answerIndex, hasAnswered: true, isCorrect, streak: isCorrect ? p.streak + 1 : 0 }
          : p
      )
    );

    // Broadcast answer to other players via realtime
    if (realtimeEnabled && realtimeConnected) {
      realtimeSubmitAnswer(answerIndex, isCorrect, userScore + points);
    }

    setTimeout(() => {
      setPhase('leaderboard');
      setLeaderboardCountdown(quizConfig.showLeaderboardFor);
      if (realtimeEnabled && realtimeConnected) {
        broadcastShowLeaderboard();
      }
    }, 1500);
  };

  const handleRunCode = async () => {
    if (!isFRQ) return;

    setIsRunningCode(true);
    setFrqOutput(null);
    setFrqError(null);

    try {
      const frq = currentQuestion as FRQQuestion;
      const response = await fetch('/api/execute-piston', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: frqCode,
          language: frq.language,
        }),
      });

      const result = await response.json();

      if (result.error) {
        setFrqError(result.error);
      } else {
        setFrqOutput(result.output);
      }
    } catch {
      setFrqError('Failed to execute code');
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleSubmitFRQ = async () => {
    if (!isFRQ || hasAnswered) return;

    setIsRunningCode(true);
    setFrqTestResults(null);
    setFrqError(null);

    try {
      const frq = currentQuestion as FRQQuestion;
      const response = await fetch('/api/execute-piston', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: frqCode,
          language: frq.language,
          testCases: frq.testCases,
        }),
      });

      const result = await response.json();
      const isCorrect = result.passed;

      setFrqTestResults(result.results || []);
      setHasAnswered(true);

      let points = 0;
      if (isCorrect) {
        const basePoints = quizConfig.pointsPerQuestion * 2; // FRQ worth more
        const timeBonus = Math.floor((timeLeft / quizConfig.frqTimeLimit) * basePoints * 0.3);
        points = basePoints + timeBonus;
        setStreak(prev => prev + 1);
      } else {
        // Partial credit for some test cases
        const passedCount = (result.results || []).filter((r: { passed: boolean }) => r.passed).length;
        const totalCount = frq.testCases.length;
        points = Math.floor((passedCount / totalCount) * quizConfig.pointsPerQuestion);
        setStreak(0);
      }

      setUserScore(prev => prev + points);

      setParticipants(prev =>
        prev.map(p =>
          p.id === currentUser?.id
            ? { ...p, score: p.score + points, currentAnswer: frqCode, hasAnswered: true, isCorrect, streak: isCorrect ? p.streak + 1 : 0 }
            : p
        )
      );

      // Broadcast FRQ answer to other players via realtime
      if (realtimeEnabled && realtimeConnected) {
        realtimeSubmitAnswer('frq_submitted', isCorrect, userScore + points);
      }

      setTimeout(() => {
        setPhase('leaderboard');
        setLeaderboardCountdown(quizConfig.showLeaderboardFor);
        if (realtimeEnabled && realtimeConnected) {
          broadcastShowLeaderboard();
        }
      }, 2000);

    } catch {
      setFrqError('Failed to validate code');
    } finally {
      setIsRunningCode(false);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex >= totalQuestions - 1) {
      setPhase('final');

      // Broadcast quiz end and save results
      if (realtimeEnabled && realtimeConnected) {
        broadcastQuizEnd();
      }

      // Save user's quiz result
      if (currentUser) {
        const leaderboard = [...participants].sort((a, b) => b.score - a.score);
        const userRank = leaderboard.findIndex(p => p.id === currentUser.id) + 1;

        saveResult({
          quizId,
          groupId,
          userId: currentUser.id,
          score: userScore,
          rank: userRank,
          totalParticipants: participants.length,
          questionsAnswered: totalQuestions,
          correctAnswers: participants.find(p => p.id === currentUser.id)?.streak || 0,
          avgResponseTimeMs: 0,
        });
      }
    } else {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setPhase('question');

      setParticipants(prev =>
        prev.map(p => ({ ...p, currentAnswer: null, hasAnswered: false, isCorrect: null }))
      );

      // Broadcast next question to other players
      if (realtimeEnabled && realtimeConnected) {
        const nextQuestion = questions[nextIndex];
        const timeLimit = nextQuestion.type === 'frq' ? quizConfig.frqTimeLimit : quizConfig.timePerQuestion;
        broadcastNextQuestion(nextIndex, timeLimit);
      }
    }
  };

  const getLeaderboard = () => {
    return [...participants].sort((a, b) => b.score - a.score);
  };

  const handleLeaveQuiz = () => {
    router.push(`/study-groups/${groupId}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${secs}s`;
  };

  // Loading / Generating state
  if (phase === 'loading' || phase === 'generating') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center z-50">
        <div className="text-center max-w-md px-6">
          <Loader2 className="w-16 h-16 animate-spin text-white mx-auto mb-6" />
          <p className="text-white text-2xl font-medium mb-2">{loadingMessage}</p>
          {phase === 'generating' && (
            <p className="text-white/60 text-sm">
              This may take a few seconds...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (phase === 'error') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center z-50">
        <div className="text-center max-w-md px-6">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h1 className="text-white text-2xl font-bold mb-2">Failed to Load Quiz</h1>
          <p className="text-white/70 mb-6">{errorMessage}</p>
          <button
            onClick={handleLeaveQuiz}
            className="px-6 py-3 bg-white text-purple-900 rounded-xl font-bold hover:bg-white/90 transition-colors"
          >
            Back to Study Group
          </button>
        </div>
      </div>
    );
  }

  // No questions loaded
  if (!currentQuestion) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center z-50">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }

  // Final Results Screen
  if (phase === 'final') {
    const leaderboard = getLeaderboard();
    const userRank = leaderboard.findIndex(p => p.id === currentUser?.id) + 1;
    const top3 = leaderboard.slice(0, 3);

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 z-50 overflow-auto">
        <button
          onClick={handleLeaveQuiz}
          className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="min-h-screen flex flex-col items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-12"
          >
            <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-5xl font-bold text-white mb-2">Quiz Complete!</h1>
            <p className="text-2xl text-white/80">
              You finished #{userRank} with {userScore.toLocaleString()} points
            </p>
          </motion.div>

          {/* Podium - only show if there are multiple participants */}
          {participants.length > 1 && (
            <div className="flex items-end justify-center gap-4 mb-12">
              {top3[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <div className={`w-20 h-20 ${top3[1].avatarColor} rounded-full flex items-center justify-center mx-auto mb-2 text-3xl font-bold text-white shadow-lg`}>
                    {top3[1].username.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-white font-semibold mb-2">{top3[1].username}</p>
                  <div className="w-24 h-32 bg-slate-400 rounded-t-lg flex items-center justify-center">
                    <div className="text-center">
                      <Medal className="w-8 h-8 text-white mx-auto mb-1" />
                      <p className="text-white font-bold">{top3[1].score.toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {top3[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center"
                >
                  <Crown className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
                  <div className={`w-24 h-24 ${top3[0].avatarColor} rounded-full flex items-center justify-center mx-auto mb-2 text-4xl font-bold text-white shadow-lg ring-4 ring-yellow-400`}>
                    {top3[0].username.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-white font-semibold text-lg mb-2">{top3[0].username}</p>
                  <div className="w-28 h-44 bg-yellow-500 rounded-t-lg flex items-center justify-center">
                    <div className="text-center">
                      <Trophy className="w-10 h-10 text-white mx-auto mb-1" />
                      <p className="text-white font-bold text-xl">{top3[0].score.toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {top3[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <div className={`w-20 h-20 ${top3[2].avatarColor} rounded-full flex items-center justify-center mx-auto mb-2 text-3xl font-bold text-white shadow-lg`}>
                    {top3[2].username.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-white font-semibold mb-2">{top3[2].username}</p>
                  <div className="w-24 h-24 bg-amber-600 rounded-t-lg flex items-center justify-center">
                    <div className="text-center">
                      <Medal className="w-8 h-8 text-white mx-auto mb-1" />
                      <p className="text-white font-bold">{top3[2].score.toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Solo mode - just show your stats */}
          {participants.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8"
            >
              <h3 className="text-white/80 text-center mb-4 font-medium">YOUR RESULTS</h3>
              <div className="text-center">
                <div className={`w-20 h-20 ${participants[0].avatarColor} rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-white`}>
                  {participants[0].username.charAt(0).toUpperCase()}
                </div>
                <p className="text-white text-xl font-semibold mb-2">{participants[0].username}</p>
                <p className="text-4xl font-bold text-yellow-400 mb-2">{userScore.toLocaleString()}</p>
                <p className="text-white/60">points</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white/60 text-sm">Questions</p>
                    <p className="text-white font-bold text-xl">{totalQuestions}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white/60 text-sm">Best Streak</p>
                    <p className="text-white font-bold text-xl">{streak}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Full leaderboard for multiplayer */}
          {participants.length > 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden"
            >
              {leaderboard.slice(3).map((participant, idx) => (
                <div
                  key={participant.id}
                  className={`flex items-center justify-between p-4 ${
                    participant.id === currentUser?.id ? 'bg-white/20' : ''
                  } ${idx > 0 ? 'border-t border-white/10' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-center text-white/60 font-bold">{idx + 4}</span>
                    <div className={`w-10 h-10 ${participant.avatarColor} rounded-full flex items-center justify-center text-white font-bold`}>
                      {participant.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white font-medium">
                      {participant.username}
                      {participant.id === currentUser?.id && ' (You)'}
                    </span>
                  </div>
                  <span className="text-white font-bold">{participant.score.toLocaleString()}</span>
                </div>
              ))}
            </motion.div>
          )}

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={handleLeaveQuiz}
            className="mt-8 px-8 py-4 bg-white text-purple-900 rounded-xl font-bold text-lg hover:bg-white/90 transition-colors"
          >
            Back to Study Group
          </motion.button>
        </div>
      </div>
    );
  }

  // Leaderboard Phase
  if (phase === 'leaderboard') {
    const leaderboard = getLeaderboard().slice(0, 5);
    const userParticipant = participants.find(p => p.id === currentUser?.id);
    const wasCorrect = userParticipant?.isCorrect;

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 z-50">
        <button
          onClick={handleLeaveQuiz}
          className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="absolute top-6 left-6 flex items-center gap-4">
          <span className="text-white/80 text-lg font-medium">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          {isFRQ && (
            <span className="px-2 py-1 bg-purple-500/50 rounded text-sm text-white">FRQ</span>
          )}
        </div>

        <div className="absolute top-6 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
            <span className="text-white/80">Next question in</span>
            <span className="text-white font-bold text-xl">{leaderboardCountdown}</span>
          </div>
        </div>

        <div className="min-h-screen flex flex-col items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            {wasCorrect ? (
              <div className="text-center">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-14 h-14 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">Correct!</h2>
                {streak > 1 && (
                  <p className="text-yellow-400 font-medium mt-2">
                    <Zap className="w-5 h-5 inline mr-1" />
                    {streak} answer streak!
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-14 h-14 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">
                  {hasAnswered ? 'Incorrect' : "Time's up!"}
                </h2>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-lg"
          >
            <h3 className="text-white/80 text-center mb-4 font-medium">
              {participants.length === 1 ? 'YOUR SCORE' : 'LEADERBOARD'}
            </h3>
            <div className="space-y-2">
              {leaderboard.map((participant, index) => (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-xl ${
                    participant.id === currentUser?.id
                      ? 'bg-white/20 ring-2 ring-white/50'
                      : 'bg-white/10'
                  }`}
                >
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    index === 0 ? 'bg-yellow-500 text-yellow-900' :
                    index === 1 ? 'bg-slate-300 text-slate-700' :
                    index === 2 ? 'bg-amber-500 text-amber-900' :
                    'bg-white/20 text-white'
                  }`}>
                    {index + 1}
                  </span>
                  <div className={`w-12 h-12 ${participant.avatarColor} rounded-full flex items-center justify-center text-xl font-bold text-white`}>
                    {participant.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">
                      {participant.username}
                      {participant.id === currentUser?.id && ' (You)'}
                    </p>
                    {participant.streak > 1 && (
                      <p className="text-yellow-400 text-sm">
                        <Zap className="w-3 h-3 inline" /> {participant.streak} streak
                      </p>
                    )}
                  </div>
                  <span className="text-white font-bold text-xl">{participant.score.toLocaleString()}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Question Phase - FRQ
  if (isFRQ) {
    const frq = currentQuestion as FRQQuestion;

    return (
      <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <span className="text-white/80 font-medium">
              {currentQuestionIndex + 1} / {totalQuestions}
            </span>
            <span className="px-2 py-1 bg-purple-500/50 rounded text-sm text-white flex items-center gap-1">
              <Code className="w-4 h-4" /> FRQ
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              timeLeft <= 60 ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'
            }`}>
              <Clock className="w-5 h-5" />
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold">{userScore.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Users className="w-5 h-5" />
              <span>{participants.length}</span>
            </div>
          </div>

          <button
            onClick={handleLeaveQuiz}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0">
          {/* Left Panel - Question */}
          <div className="w-1/3 bg-slate-800 p-6 overflow-y-auto border-r border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Problem</h2>
            <div className="text-white/90 whitespace-pre-wrap mb-6">{frq.question}</div>

            {frq.hints && frq.hints.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-white/60 mb-2">HINTS</h3>
                <ul className="space-y-2">
                  {frq.hints.map((hint, idx) => (
                    <li key={idx} className="text-sm text-white/70 bg-white/5 p-3 rounded-lg">
                      {hint}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-white/60 mb-2">TEST CASES</h3>
              <div className="space-y-2">
                {frq.testCases.slice(0, 2).map((tc, idx) => (
                  <div key={idx} className="bg-white/5 p-3 rounded-lg text-sm">
                    <div className="text-white/60 mb-1">Input:</div>
                    <code className="text-green-400">{tc.input || '(none)'}</code>
                    <div className="text-white/60 mt-2 mb-1">Expected:</div>
                    <code className="text-blue-400">{tc.expectedOutput}</code>
                  </div>
                ))}
                {frq.testCases.length > 2 && (
                  <p className="text-white/40 text-sm">+ {frq.testCases.length - 2} hidden test cases</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Editor & Output */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                language={frq.language}
                value={frqCode}
                onChange={(value) => setFrqCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  readOnly: hasAnswered,
                }}
              />
            </div>

            {/* Output Panel */}
            <div className="h-48 bg-slate-900 border-t border-slate-700 flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
                <span className="text-sm font-medium text-white/80">Output</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleRunCode}
                    disabled={isRunningCode || hasAnswered}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRunningCode ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Run
                  </button>
                  <button
                    onClick={handleSubmitFRQ}
                    disabled={isRunningCode || hasAnswered}
                    className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRunningCode ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Submit
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
                {frqTestResults ? (
                  <div className="space-y-2">
                    {frqTestResults.map((result, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-3 rounded-lg ${
                          result.passed ? 'bg-green-900/30 border border-green-500/30' : 'bg-red-900/30 border border-red-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {result.passed ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <X className="w-4 h-4 text-red-400" />
                          )}
                          <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
                            Test {idx + 1}: {result.passed ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                        {!result.passed && (
                          <div className="text-xs space-y-1 text-white/70">
                            <div>Expected: <code className="text-blue-400">{result.expected}</code></div>
                            <div>Got: <code className="text-red-400">{result.actual || '(no output)'}</code></div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : frqError ? (
                  <pre className="text-red-400 whitespace-pre-wrap">{frqError}</pre>
                ) : frqOutput !== null ? (
                  <pre className="text-green-400 whitespace-pre-wrap">{frqOutput || '(no output)'}</pre>
                ) : (
                  <span className="text-white/40">Run your code to see output...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Waiting indicator */}
        {hasAnswered && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
            <p className="text-white/80">Waiting for other players...</p>
          </div>
        )}
      </div>
    );
  }

  // Question Phase - MCQ
  const mcq = currentQuestion as MCQQuestion;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 z-50">
      <button
        onClick={handleLeaveQuiz}
        className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <div className="absolute top-6 left-6 right-24 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-white/80 text-lg font-medium">
            {currentQuestionIndex + 1} / {totalQuestions}
          </span>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-white/60" />
            <span className="text-white/80">{participants.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="text-white font-bold">{userScore.toLocaleString()}</span>
        </div>
      </div>

      <div className="absolute top-24 left-1/2 -translate-x-1/2">
        <motion.div
          className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold ${
            timeLeft <= 5 ? 'bg-red-500 text-white' : 'bg-white/20 text-white'
          }`}
          animate={timeLeft <= 5 ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >
          {timeLeft}
        </motion.div>
      </div>

      <div className="min-h-screen flex items-center justify-center p-8 pt-32">
        <motion.div
          key={mcq.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl"
        >
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-8 bg-gradient-to-r from-indigo-500 to-purple-500">
              <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
                {mcq.question}
              </h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {mcq.choices.map((choice, idx) => {
                const colors = [
                  'bg-red-500 hover:bg-red-600',
                  'bg-blue-500 hover:bg-blue-600',
                  'bg-yellow-500 hover:bg-yellow-600',
                  'bg-green-500 hover:bg-green-600',
                ];
                const isSelected = selectedAnswer === choice.index;
                const isCorrect = hasAnswered && choice.index === mcq.correctAnswerIndex;
                const isWrong = hasAnswered && isSelected && choice.index !== mcq.correctAnswerIndex;

                return (
                  <motion.button
                    key={choice.index}
                    onClick={() => handleMCQAnswer(choice.index)}
                    disabled={hasAnswered}
                    whileHover={!hasAnswered ? { scale: 1.02 } : {}}
                    whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                    className={`p-6 rounded-xl text-white font-semibold text-lg transition-all ${
                      hasAnswered
                        ? isCorrect
                          ? 'bg-green-500 ring-4 ring-green-300'
                          : isWrong
                          ? 'bg-red-500 opacity-60'
                          : 'opacity-40 ' + colors[idx]
                        : colors[idx]
                    } ${isSelected && !hasAnswered ? 'ring-4 ring-white ring-offset-2' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 text-left">{choice.text}</span>
                      {hasAnswered && isCorrect && <Check className="w-6 h-6" />}
                      {hasAnswered && isWrong && <X className="w-6 h-6" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {hasAnswered && participants.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-6"
            >
              <p className="text-white/80 text-lg">Waiting for other players...</p>
              <div className="flex justify-center gap-2 mt-4">
                {participants.map(p => (
                  <div
                    key={p.id}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      p.hasAnswered ? 'bg-green-400' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
