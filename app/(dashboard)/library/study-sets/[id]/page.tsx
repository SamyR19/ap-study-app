'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Edit,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FlashcardSet, Flashcard } from '@/types/study-tools';

export default function StudySetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const setId = params.id as string;
  const startPractice = searchParams.get('practice') === 'true';

  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Practice mode state
  const [isPracticing, setIsPracticing] = useState(startPractice);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [practiceCards, setPracticeCards] = useState<Flashcard[]>([]);
  const [knownCount, setKnownCount] = useState(0);
  const [learningCount, setLearningCount] = useState(0);

  useEffect(() => {
    loadSetData();
  }, [setId]);

  const loadSetData = async () => {
    try {
      // Load set
      const { data: setData, error: setError } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('id', setId)
        .single();

      if (setError) throw setError;
      setSet(setData);

      // Load cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId)
        .order('position');

      if (cardsError) throw cardsError;
      setCards(cardsData || []);
      setPracticeCards(cardsData || []);
    } catch (error) {
      console.error('Error loading study set:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startPracticeMode = () => {
    setPracticeCards([...cards]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCount(0);
    setLearningCount(0);
    setIsPracticing(true);
  };

  const shuffleCards = () => {
    const shuffled = [...practiceCards].sort(() => Math.random() - 0.5);
    setPracticeCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKnown = async () => {
    setKnownCount(prev => prev + 1);
    const currentCard = practiceCards[currentIndex];

    // Update stats in database
    await supabase
      .from('flashcards')
      .update({
        times_reviewed: currentCard.times_reviewed + 1,
        times_correct: currentCard.times_correct + 1,
        last_reviewed: new Date().toISOString(),
      })
      .eq('id', currentCard.id);

    nextCard();
  };

  const handleLearning = async () => {
    setLearningCount(prev => prev + 1);
    const currentCard = practiceCards[currentIndex];

    // Update stats in database
    await supabase
      .from('flashcards')
      .update({
        times_reviewed: currentCard.times_reviewed + 1,
        last_reviewed: new Date().toISOString(),
      })
      .eq('id', currentCard.id);

    nextCard();
  };

  const nextCard = () => {
    setIsFlipped(false);
    if (currentIndex < practiceCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevCard = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPracticing) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowLeft') {
        prevCard();
      } else if (e.key === 'ArrowRight') {
        nextCard();
      } else if (e.key === '1' && isFlipped) {
        handleLearning();
      } else if (e.key === '2' && isFlipped) {
        handleKnown();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPracticing, isFlipped, currentIndex]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!set) {
    return (
      <div className="text-center py-16">
        <p className="text-charcoal-light">Study set not found</p>
      </div>
    );
  }

  const isComplete = currentIndex >= practiceCards.length - 1 && (knownCount + learningCount > 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => isPracticing ? setIsPracticing(false) : router.push('/library/study-sets')}
            className="p-2 rounded-lg hover:bg-cream-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-charcoal" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-charcoal">{set.title}</h1>
            {set.description && (
              <p className="text-charcoal-light">{set.description}</p>
            )}
          </div>
        </div>

        {!isPracticing && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/library/study-sets/${setId}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-cream-200 rounded-xl text-charcoal hover:bg-cream-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={startPracticeMode}
              className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors"
            >
              <Play className="w-4 h-4" />
              Practice
            </button>
          </div>
        )}
      </div>

      {/* Practice Mode */}
      {isPracticing ? (
        <div className="space-y-6">
          {/* Progress */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={shuffleCards}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-cream-100 rounded-lg text-charcoal hover:bg-cream-200 transition-colors"
              >
                <Shuffle className="w-4 h-4" />
                Shuffle
              </button>
              <button
                onClick={startPracticeMode}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-cream-100 rounded-lg text-charcoal hover:bg-cream-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Restart
              </button>
            </div>
            <div className="text-sm text-charcoal-light">
              {currentIndex + 1} / {practiceCards.length}
            </div>
          </div>

          {/* Flashcard */}
          <div className="relative h-80 perspective-1000">
            <motion.div
              className="w-full h-full cursor-pointer"
              onClick={handleFlip}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 bg-white rounded-2xl border border-cream-200 p-8 flex items-center justify-center backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <p className="text-xl text-center text-charcoal">
                  {practiceCards[currentIndex]?.front}
                </p>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 bg-charcoal rounded-2xl p-8 flex items-center justify-center"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <p className="text-xl text-center text-white">
                  {practiceCards[currentIndex]?.back}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevCard}
              disabled={currentIndex === 0}
              className="p-3 rounded-xl bg-cream-100 text-charcoal hover:bg-cream-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {isFlipped ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLearning}
                  className="flex items-center gap-2 px-6 py-3 bg-amber-100 text-amber-700 rounded-xl font-medium hover:bg-amber-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                  Still learning
                </button>
                <button
                  onClick={handleKnown}
                  className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-xl font-medium hover:bg-green-200 transition-colors"
                >
                  <Check className="w-5 h-5" />
                  Got it
                </button>
              </div>
            ) : (
              <p className="text-charcoal-light">Click card or press Space to flip</p>
            )}

            <button
              onClick={nextCard}
              disabled={currentIndex === practiceCards.length - 1}
              className="p-3 rounded-xl bg-cream-100 text-charcoal hover:bg-cream-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 pt-4 border-t border-cream-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{knownCount}</p>
              <p className="text-sm text-charcoal-light">Known</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{learningCount}</p>
              <p className="text-sm text-charcoal-light">Learning</p>
            </div>
          </div>

          {/* Completion message */}
          {isComplete && knownCount + learningCount === practiceCards.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"
            >
              <h3 className="text-lg font-semibold text-green-700 mb-2">Practice Complete!</h3>
              <p className="text-green-600 mb-4">
                You got {knownCount} out of {practiceCards.length} cards correct
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={startPracticeMode}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                >
                  Practice Again
                </button>
                <button
                  onClick={() => setIsPracticing(false)}
                  className="px-4 py-2 bg-white border border-green-200 text-green-700 rounded-xl font-medium hover:bg-green-50 transition-colors"
                >
                  View All Cards
                </button>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        /* View Mode - Card List */
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-charcoal-light">{cards.length} {cards.length === 1 ? 'card' : 'cards'}</p>
          </div>

          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="bg-white rounded-xl border border-cream-200 overflow-hidden"
            >
              <div className="grid grid-cols-2 divide-x divide-cream-200">
                <div className="p-4">
                  <p className="text-xs font-medium text-charcoal-light uppercase mb-1">Term</p>
                  <p className="text-charcoal">{card.front}</p>
                </div>
                <div className="p-4">
                  <p className="text-xs font-medium text-charcoal-light uppercase mb-1">Definition</p>
                  <p className="text-charcoal">{card.back}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
