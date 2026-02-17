'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PracticeHeaderProps {
  topicName: string;
  topicIcon: string;
  currentQuestion: number;
  totalQuestions: number;
  timeElapsed?: number; // in seconds
  showTimer?: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function PracticeHeader({
  topicName,
  topicIcon,
  currentQuestion,
  totalQuestions,
  timeElapsed = 0,
  showTimer = false,
}: PracticeHeaderProps) {
  const router = useRouter();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const progress = (currentQuestion / totalQuestions) * 100;

  const handleExit = () => {
    router.push('/dashboard');
  };

  return (
    <>
      <div className="bg-white border-b border-cream-300 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Topic Info */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">{topicIcon}</span>
              <div>
                <h1 className="font-semibold text-charcoal">{topicName}</h1>
                <p className="text-sm text-charcoal-light">
                  Question {currentQuestion} of {totalQuestions}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex-1 max-w-md hidden md:block">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-charcoal-light">
                  {Math.round(progress)}% complete
                </span>
                <span className="text-xs text-charcoal-light">
                  {totalQuestions - currentQuestion} remaining
                </span>
              </div>
            </div>

            {/* Timer & Exit */}
            <div className="flex items-center gap-3">
              {showTimer && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-cream-200 rounded-lg">
                  <Clock className="w-4 h-4 text-charcoal-light" />
                  <span className="font-mono text-sm text-charcoal">
                    {formatTime(timeElapsed)}
                  </span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowExitDialog(true)}
                className="text-charcoal-light hover:text-charcoal hover:bg-cream-200"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Progress */}
          <div className="md:hidden mt-3">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exit Practice Session?</DialogTitle>
            <DialogDescription>
              Your progress will be saved. You can continue where you left off later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowExitDialog(false)}
              className="border-cream-300"
            >
              Continue Practicing
            </Button>
            <Button
              onClick={handleExit}
              className="bg-charcoal hover:bg-charcoal/90 text-white"
            >
              Exit Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
