'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';

const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseKey);
};

export interface QuizParticipant {
  id: string;
  username: string;
  avatarColor: string;
  score: number;
  currentAnswer: number | string | null;
  hasAnswered: boolean;
  isCorrect: boolean | null;
  streak: number;
  isOnline: boolean;
}

export interface QuizState {
  phase: 'waiting' | 'countdown' | 'question' | 'leaderboard' | 'final';
  currentQuestionIndex: number;
  timeLeft: number;
  participants: QuizParticipant[];
  hostId: string;
}

interface UseQuizRealtimeOptions {
  quizId: string;
  groupId: string;
  userId: string;
  username: string;
  onStateChange?: (state: QuizState) => void;
  onParticipantJoin?: (participant: QuizParticipant) => void;
  onParticipantLeave?: (participantId: string) => void;
  onAnswerSubmitted?: (participantId: string, answer: number | string) => void;
}

export function useQuizRealtime({
  quizId,
  groupId,
  userId,
  username,
  onStateChange,
  onParticipantJoin,
  onParticipantLeave,
  onAnswerSubmitted,
}: UseQuizRealtimeOptions) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<QuizParticipant[]>([]);
  const [quizState, setQuizState] = useState<QuizState | null>(null);

  // Initialize realtime connection
  useEffect(() => {
    const supabase = getSupabase();
    const channelName = `quiz:${groupId}:${quizId}`;

    const quizChannel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    // Handle presence sync (who's online)
    quizChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = quizChannel.presenceState();
        const onlineUsers = Object.keys(presenceState).map((key) => {
          const presence = presenceState[key][0] as unknown as {
            id: string;
            username: string;
            avatarColor: string;
            score: number;
          };
          return {
            id: presence.id || key,
            username: presence.username || 'Unknown',
            avatarColor: presence.avatarColor || 'bg-blue-400',
            score: presence.score || 0,
            currentAnswer: null,
            hasAnswered: false,
            isCorrect: null,
            streak: 0,
            isOnline: true,
          };
        });
        setParticipants(onlineUsers);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const presence = newPresences[0] as unknown as {
          id: string;
          username: string;
          avatarColor: string;
        };
        const newParticipant: QuizParticipant = {
          id: presence.id,
          username: presence.username,
          avatarColor: presence.avatarColor,
          score: 0,
          currentAnswer: null,
          hasAnswered: false,
          isCorrect: null,
          streak: 0,
          isOnline: true,
        };
        onParticipantJoin?.(newParticipant);
      })
      .on('presence', { event: 'leave' }, ({ key: participantKey }) => {
        onParticipantLeave?.(participantKey);
      });

    // Handle broadcast messages
    quizChannel
      .on('broadcast', { event: 'quiz_state' }, ({ payload }) => {
        const state = payload as QuizState;
        setQuizState(state);
        onStateChange?.(state);
      })
      .on('broadcast', { event: 'answer_submitted' }, ({ payload }) => {
        const { participantId, answer, isCorrect, score } = payload as {
          participantId: string;
          answer: number | string;
          isCorrect: boolean;
          score: number;
        };

        setParticipants((prev) =>
          prev.map((p) =>
            p.id === participantId
              ? {
                  ...p,
                  currentAnswer: answer,
                  hasAnswered: true,
                  isCorrect,
                  score,
                  streak: isCorrect ? p.streak + 1 : 0,
                }
              : p
          )
        );

        onAnswerSubmitted?.(participantId, answer);
      })
      .on('broadcast', { event: 'next_question' }, ({ payload }) => {
        const { questionIndex, timeLeft } = payload as {
          questionIndex: number;
          timeLeft: number;
        };

        // Reset answer states for all participants
        setParticipants((prev) =>
          prev.map((p) => ({
            ...p,
            currentAnswer: null,
            hasAnswered: false,
            isCorrect: null,
          }))
        );

        setQuizState((prev) =>
          prev
            ? {
                ...prev,
                phase: 'question',
                currentQuestionIndex: questionIndex,
                timeLeft,
              }
            : null
        );
      })
      .on('broadcast', { event: 'show_leaderboard' }, () => {
        setQuizState((prev) =>
          prev ? { ...prev, phase: 'leaderboard' } : null
        );
      })
      .on('broadcast', { event: 'quiz_end' }, () => {
        setQuizState((prev) => (prev ? { ...prev, phase: 'final' } : null));
      });

    // Subscribe and track presence
    quizChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);

        // Track this user's presence
        const avatarColors = [
          'bg-pink-400',
          'bg-blue-400',
          'bg-green-400',
          'bg-purple-400',
          'bg-yellow-400',
          'bg-red-400',
        ];
        const randomColor =
          avatarColors[Math.floor(Math.random() * avatarColors.length)];

        await quizChannel.track({
          id: userId,
          username,
          avatarColor: randomColor,
          score: 0,
          online_at: new Date().toISOString(),
        });
      }
    });

    setChannel(quizChannel);

    return () => {
      quizChannel.unsubscribe();
    };
  }, [quizId, groupId, userId, username]);

  // Broadcast answer submission
  const submitAnswer = useCallback(
    async (answer: number | string, isCorrect: boolean, score: number) => {
      if (!channel) return;

      await channel.send({
        type: 'broadcast',
        event: 'answer_submitted',
        payload: {
          participantId: userId,
          answer,
          isCorrect,
          score,
        },
      });
    },
    [channel, userId]
  );

  // Host-only: Broadcast quiz state changes
  const broadcastState = useCallback(
    async (state: Partial<QuizState>) => {
      if (!channel) return;

      await channel.send({
        type: 'broadcast',
        event: 'quiz_state',
        payload: state,
      });
    },
    [channel]
  );

  // Host-only: Move to next question
  const broadcastNextQuestion = useCallback(
    async (questionIndex: number, timeLimit: number) => {
      if (!channel) return;

      await channel.send({
        type: 'broadcast',
        event: 'next_question',
        payload: {
          questionIndex,
          timeLeft: timeLimit,
        },
      });
    },
    [channel]
  );

  // Host-only: Show leaderboard
  const broadcastShowLeaderboard = useCallback(async () => {
    if (!channel) return;

    await channel.send({
      type: 'broadcast',
      event: 'show_leaderboard',
      payload: {},
    });
  }, [channel]);

  // Host-only: End quiz
  const broadcastQuizEnd = useCallback(async () => {
    if (!channel) return;

    await channel.send({
      type: 'broadcast',
      event: 'quiz_end',
      payload: {},
    });
  }, [channel]);

  // Update presence score
  const updateScore = useCallback(
    async (newScore: number) => {
      if (!channel) return;

      const avatarColors = [
        'bg-pink-400',
        'bg-blue-400',
        'bg-green-400',
        'bg-purple-400',
        'bg-yellow-400',
        'bg-red-400',
      ];
      const randomColor =
        avatarColors[Math.floor(Math.random() * avatarColors.length)];

      await channel.track({
        id: userId,
        username,
        avatarColor: randomColor,
        score: newScore,
        online_at: new Date().toISOString(),
      });
    },
    [channel, userId, username]
  );

  return {
    isConnected,
    participants,
    quizState,
    submitAnswer,
    broadcastState,
    broadcastNextQuestion,
    broadcastShowLeaderboard,
    broadcastQuizEnd,
    updateScore,
  };
}

// Hook for saving quiz results to database
export function useSaveQuizResult() {
  const saveResult = useCallback(
    async ({
      quizId,
      userId,
      score,
      rank,
      questionsAnswered,
      correctAnswers,
    }: {
      quizId: string;
      groupId: string;
      userId: string;
      score: number;
      rank: number;
      totalParticipants: number;
      questionsAnswered: number;
      correctAnswers: number;
      avgResponseTimeMs: number;
    }) => {
      const supabase = getSupabase();

      // Save to quiz_participants table (if it exists)
      try {
        await supabase.from('quiz_participants').upsert({
          quiz_session_id: quizId,
          user_id: userId,
          score,
          rank,
          completed_at: new Date().toISOString(),
        });

        // Update user quiz stats
        const { data: existingStats } = await supabase
          .from('user_quiz_stats')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (existingStats) {
          await supabase
            .from('user_quiz_stats')
            .update({
              total_quizzes_taken: existingStats.total_quizzes_taken + 1,
              total_questions_answered:
                existingStats.total_questions_answered + questionsAnswered,
              correct_answers: existingStats.correct_answers + correctAnswers,
              total_points: existingStats.total_points + score,
              highest_score: Math.max(existingStats.highest_score, score),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
        } else {
          await supabase.from('user_quiz_stats').insert({
            user_id: userId,
            total_quizzes_taken: 1,
            total_questions_answered: questionsAnswered,
            correct_answers: correctAnswers,
            total_points: score,
            highest_score: score,
          });
        }
      } catch (error) {
        console.error('Error saving quiz result:', error);
      }
    },
    []
  );

  return { saveResult };
}
