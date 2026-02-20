'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';

const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseKey);
};

export interface QuizInvitation {
  id: string;
  quizId: string;
  hostId: string;
  hostName: string;
  groupId: string;
  groupName: string;
  title: string;
  questionCount: number;
  questionTypes: ('mcq' | 'frq')[];
  timePerQuestion: number;
  createdAt: string;
  expiresAt: string;
  participants: string[];
}

interface UseQuizInvitationsOptions {
  groupId: string;
  userId: string;
  onInvitation?: (invitation: QuizInvitation) => void;
}

export function useQuizInvitations({
  groupId,
  userId,
  onInvitation,
}: UseQuizInvitationsOptions) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [activeInvitations, setActiveInvitations] = useState<QuizInvitation[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize realtime connection for group quiz invitations
  useEffect(() => {
    if (!groupId || !userId) return;

    const supabase = getSupabase();
    const channelName = `quiz-invitations:${groupId}`;

    const invitationChannel = supabase.channel(channelName);

    // Listen for new quiz invitations
    invitationChannel
      .on('broadcast', { event: 'quiz_invitation' }, ({ payload }) => {
        const invitation = payload as QuizInvitation;

        // Don't show invitation to the host
        if (invitation.hostId === userId) return;

        // Check if invitation is still valid
        if (new Date(invitation.expiresAt) < new Date()) return;

        setActiveInvitations((prev) => {
          // Don't add duplicates
          if (prev.find((i) => i.quizId === invitation.quizId)) return prev;
          return [...prev, invitation];
        });

        onInvitation?.(invitation);
      })
      .on('broadcast', { event: 'quiz_started' }, ({ payload }) => {
        const { quizId } = payload as { quizId: string };
        // Remove invitation when quiz starts
        setActiveInvitations((prev) =>
          prev.filter((i) => i.quizId !== quizId)
        );
      })
      .on('broadcast', { event: 'quiz_cancelled' }, ({ payload }) => {
        const { quizId } = payload as { quizId: string };
        // Remove invitation when quiz is cancelled
        setActiveInvitations((prev) =>
          prev.filter((i) => i.quizId !== quizId)
        );
      })
      .on('broadcast', { event: 'participant_joined' }, ({ payload }) => {
        const { quizId, participantId } = payload as {
          quizId: string;
          participantId: string;
          participantName: string;
        };
        // Update participant count
        setActiveInvitations((prev) =>
          prev.map((i) =>
            i.quizId === quizId
              ? { ...i, participants: [...i.participants, participantId] }
              : i
          )
        );
      });

    invitationChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
      }
    });

    setChannel(invitationChannel);

    return () => {
      invitationChannel.unsubscribe();
    };
  }, [groupId, userId, onInvitation]);

  // Clean up expired invitations
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveInvitations((prev) =>
        prev.filter((i) => new Date(i.expiresAt) > new Date())
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Broadcast a new quiz invitation
  const broadcastInvitation = useCallback(
    async (invitation: Omit<QuizInvitation, 'createdAt' | 'expiresAt' | 'participants'>) => {
      if (!channel) return;

      const fullInvitation: QuizInvitation = {
        ...invitation,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60000).toISOString(), // 60 second timeout
        participants: [invitation.hostId],
      };

      await channel.send({
        type: 'broadcast',
        event: 'quiz_invitation',
        payload: fullInvitation,
      });

      return fullInvitation;
    },
    [channel]
  );

  // Join a quiz
  const joinQuiz = useCallback(
    async (quizId: string, participantName: string) => {
      if (!channel) return;

      await channel.send({
        type: 'broadcast',
        event: 'participant_joined',
        payload: {
          quizId,
          participantId: userId,
          participantName,
        },
      });

      // Remove from local invitations
      setActiveInvitations((prev) =>
        prev.filter((i) => i.quizId !== quizId)
      );
    },
    [channel, userId]
  );

  // Decline/dismiss an invitation
  const dismissInvitation = useCallback((quizId: string) => {
    setActiveInvitations((prev) =>
      prev.filter((i) => i.quizId !== quizId)
    );
  }, []);

  // Broadcast that quiz has started
  const broadcastQuizStarted = useCallback(
    async (quizId: string) => {
      if (!channel) return;

      await channel.send({
        type: 'broadcast',
        event: 'quiz_started',
        payload: { quizId },
      });
    },
    [channel]
  );

  // Broadcast that quiz was cancelled
  const broadcastQuizCancelled = useCallback(
    async (quizId: string) => {
      if (!channel) return;

      await channel.send({
        type: 'broadcast',
        event: 'quiz_cancelled',
        payload: { quizId },
      });
    },
    [channel]
  );

  return {
    isConnected,
    activeInvitations,
    broadcastInvitation,
    joinQuiz,
    dismissInvitation,
    broadcastQuizStarted,
    broadcastQuizCancelled,
  };
}
