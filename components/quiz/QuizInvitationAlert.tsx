'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, Users, Clock, CheckCircle } from 'lucide-react';
import { QuizInvitation } from '@/lib/use-quiz-invitations';

interface QuizInvitationAlertProps {
  invitation: QuizInvitation;
  onJoin: (quizId: string) => void;
  onDismiss: (quizId: string) => void;
}

export default function QuizInvitationAlert({
  invitation,
  onJoin,
  onDismiss,
}: QuizInvitationAlertProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const updateTimeLeft = () => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(invitation.expiresAt).getTime() - Date.now()) / 1000)
      );
      setTimeLeft(remaining);

      if (remaining === 0) {
        onDismiss(invitation.quizId);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [invitation.expiresAt, invitation.quizId, onDismiss]);

  const questionTypeLabel = invitation.questionTypes.includes('mcq') && invitation.questionTypes.includes('frq')
    ? 'Mixed'
    : invitation.questionTypes.includes('frq')
    ? 'FRQ'
    : 'MCQ';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-4 shadow-lg border-2 border-primary-400"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white">{invitation.hostName} started a quiz!</h3>
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium text-white">
                {questionTypeLabel}
              </span>
            </div>
            <p className="text-white/90 text-sm mt-0.5">{invitation.title}</p>
            <div className="flex items-center gap-4 mt-2 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {invitation.questionCount} questions
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {invitation.timePerQuestion}s each
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {invitation.participants.length} joined
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onDismiss(invitation.quizId)}
          className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white"
              initial={{ width: '100%' }}
              animate={{ width: `${(timeLeft / 60) * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <span className="text-white/80 text-sm font-mono">{timeLeft}s</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onDismiss(invitation.quizId)}
            className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
          >
            Not now
          </button>
          <button
            onClick={() => onJoin(invitation.quizId)}
            className="px-4 py-2 bg-white text-primary-600 rounded-lg font-bold hover:bg-white/90 transition-colors"
          >
            Join Quiz
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Container for multiple invitations
interface QuizInvitationContainerProps {
  invitations: QuizInvitation[];
  onJoin: (quizId: string) => void;
  onDismiss: (quizId: string) => void;
}

export function QuizInvitationContainer({
  invitations,
  onJoin,
  onDismiss,
}: QuizInvitationContainerProps) {
  if (invitations.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      <AnimatePresence>
        {invitations.map((invitation) => (
          <QuizInvitationAlert
            key={invitation.quizId}
            invitation={invitation}
            onJoin={onJoin}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
