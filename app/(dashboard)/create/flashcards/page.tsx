'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Sparkles,
  Import,
  Loader2,
  Play,
  X,
  Info,
} from 'lucide-react';
import { FlashcardRow } from '@/components/create/FlashcardRow';
import { supabase } from '@/lib/supabase';

interface FlashcardData {
  id: string;
  front: string;
  back: string;
}

interface GeneratedCard {
  front: string;
  back: string;
}

export default function CreateFlashcardsPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState<FlashcardData[]>([
    { id: '1', front: '', back: '' },
    { id: '2', front: '', back: '' },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');

  // AI Smart Assist state
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [showGenerated, setShowGenerated] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxCharacters = 100000;
  const characterCount = aiPrompt.length;

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Add a new card
  const addCard = () => {
    setCards([...cards, { id: generateId(), front: '', back: '' }]);
  };

  // Update card content
  const updateCard = (id: string, field: 'front' | 'back', value: string) => {
    setCards(cards.map(card =>
      card.id === id ? { ...card, [field]: value } : card
    ));
  };

  // Delete a card
  const deleteCard = (id: string) => {
    if (cards.length > 1) {
      setCards(cards.filter(card => card.id !== id));
    }
  };

  // Add AI-generated cards
  const addGeneratedCards = (newCards: GeneratedCard[]) => {
    const cardsWithIds = newCards.map(card => ({
      ...card,
      id: generateId(),
    }));
    setCards([...cards.filter(c => c.front || c.back), ...cardsWithIds]);
    setGeneratedCards([]);
    setShowGenerated(false);
  };

  // Add single generated card
  const addSingleCard = (card: GeneratedCard) => {
    const cardWithId = { ...card, id: generateId() };
    setCards([...cards.filter(c => c.front || c.back), cardWithId]);
    setGeneratedCards(prev => prev.filter(c => c.front !== card.front));
  };

  // Handle AI generation
  const handleGenerate = async () => {
    if (!aiPrompt.trim() || isGenerating) return;

    setIsGenerating(true);

    try {
      const existingTerms = cards
        .filter(c => c.front.trim())
        .map(c => c.front.trim());

      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: aiPrompt,
          count: 10,
          existingTerms,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate');

      const data = await response.json();

      if (data.flashcards && Array.isArray(data.flashcards)) {
        setGeneratedCards(data.flashcards);
        setShowGenerated(true);

        // Auto-fill title and description if empty
        if (!title.trim() && data.title) {
          setTitle(data.title);
        }
        if (!description.trim() && data.description) {
          setDescription(data.description);
        }
      }
    } catch {
      alert('Failed to generate flashcards. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Import from text
  const handleImport = () => {
    const lines = importText.trim().split('\n');
    const importedCards: FlashcardData[] = [];

    for (const line of lines) {
      const parts = line.includes('\t')
        ? line.split('\t')
        : line.split(' - ');

      if (parts.length >= 2) {
        importedCards.push({
          id: generateId(),
          front: parts[0].trim(),
          back: parts.slice(1).join(' - ').trim(),
        });
      }
    }

    if (importedCards.length > 0) {
      setCards([...cards.filter(c => c.front || c.back), ...importedCards]);
      setShowImportModal(false);
      setImportText('');
    }
  };

  // Save flashcard set
  const handleSave = async (andPractice = false) => {
    const validCards = cards.filter(c => c.front.trim() && c.back.trim());
    if (!title.trim()) {
      alert('Please enter a title for your flashcard set');
      return;
    }
    if (validCards.length === 0) {
      alert('Please add at least one card with both term and definition');
      return;
    }

    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: setData, error: setError } = await supabase
        .from('flashcard_sets')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          is_public: false,
          card_count: validCards.length,
        })
        .select()
        .single();

      if (setError) {
        console.error('Set error:', setError);
        throw setError;
      }

      const flashcardsToInsert = validCards.map((card, index) => ({
        set_id: setData.id,
        user_id: user.id,
        front: card.front.trim(),
        back: card.back.trim(),
        position: index,
        times_reviewed: 0,
        times_correct: 0,
      }));

      const { error: cardsError } = await supabase
        .from('flashcards')
        .insert(flashcardsToInsert);

      if (cardsError) {
        console.error('Cards error:', cardsError);
        throw cardsError;
      }

      if (andPractice) {
        router.push(`/library/study-sets/${setData.id}?practice=true`);
      } else {
        router.push(`/library/study-sets/${setData.id}`);
      }
    } catch (error) {
      console.error('Error saving flashcard set:', error);
      alert('Failed to save flashcard set. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const validCardsCount = cards.filter(c => c.front.trim() && c.back.trim()).length;

  return (
    <div className="min-h-screen flex">
      {/* Main Content - Left Side */}
      <div className="flex-1 max-w-3xl">
        {/* Header */}
        <div className="sticky top-0 bg-cream-50 z-10 px-6 py-4 border-b border-cream-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-cream-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-charcoal" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-charcoal">Create flashcard set</h1>
                <p className="text-sm text-charcoal-light">
                  {validCardsCount} {validCardsCount === 1 ? 'card' : 'cards'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors disabled:opacity-50"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Create
              </button>

              <button
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                Create & Practice
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title & Description */}
          <div className="space-y-4 mb-8">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title, like 'Java Arrays'"
              className="w-full px-4 py-3 text-lg font-medium bg-white border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-charcoal-light/50"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (optional)"
              className="w-full px-4 py-3 bg-white border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-charcoal-light/50"
            />
          </div>

          {/* Import Button */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-cream-200 rounded-xl text-charcoal hover:bg-cream-50 transition-colors"
            >
              <Import className="w-4 h-4" />
              Import from text
            </button>
          </div>

          {/* Flashcard Rows */}
          <div className="space-y-4 mb-6">
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FlashcardRow
                  index={index + 1}
                  front={card.front}
                  back={card.back}
                  onFrontChange={(value) => updateCard(card.id, 'front', value)}
                  onBackChange={(value) => updateCard(card.id, 'back', value)}
                  onDelete={() => deleteCard(card.id)}
                />
              </motion.div>
            ))}
          </div>

          {/* Add Card Button */}
          <button
            onClick={addCard}
            className="w-full py-4 border-2 border-dashed border-cream-300 rounded-xl text-charcoal-light hover:text-charcoal hover:border-charcoal-light transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add card
          </button>
        </div>
      </div>

      {/* AI Smart Assist Sidebar */}
      <div className="w-[400px] border-l border-cream-200 bg-cream-50/50 flex flex-col h-[calc(100vh-4rem)] sticky top-16">
        {/* Header */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <span className="font-semibold text-charcoal">Smart Assist</span>
            <span className="px-2 py-0.5 text-xs font-medium bg-cream-200 text-charcoal-light rounded-full">
              Beta
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 px-5 pb-4 flex flex-col min-h-0 overflow-hidden">
          {showGenerated && generatedCards.length > 0 ? (
            /* Generated Cards View */
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <span className="text-sm font-medium text-charcoal">
                  Generated {generatedCards.length} cards
                </span>
                <button
                  onClick={() => setShowGenerated(false)}
                  className="p-1 hover:bg-cream-200 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-charcoal-light" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0">
                {generatedCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-cream-200 p-4"
                  >
                    <p className="font-medium text-charcoal text-sm mb-2">
                      {card.front}
                    </p>
                    <p className="text-charcoal-light text-sm mb-3">
                      {card.back}
                    </p>
                    <button
                      onClick={() => addSingleCard(card)}
                      className="text-sm text-primary-500 hover:text-primary-600 font-medium"
                    >
                      + Add this card
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => addGeneratedCards(generatedCards)}
                className="w-full py-3 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors flex-shrink-0"
              >
                Add All {generatedCards.length} Cards
              </button>
            </div>
          ) : (
            /* Prompt Input View */
            <div className="flex-1 flex flex-col">
              <div className="flex-1 bg-white rounded-2xl border border-cream-200 p-4 mb-4 flex flex-col">
                <textarea
                  ref={textareaRef}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value.slice(0, maxCharacters))}
                  placeholder='Enter a prompt (e.g. "summarize photosynthesis"), paste notes or upload a document to create flashcards.'
                  className="flex-1 w-full resize-none text-charcoal placeholder:text-charcoal-light/60 focus:outline-none text-sm leading-relaxed"
                />
                <div className="text-right text-sm text-charcoal-light mt-2">
                  {characterCount.toLocaleString()}/{maxCharacters.toLocaleString()}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mb-4">
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-cream-100 text-primary-500 rounded-xl font-medium hover:bg-cream-200 transition-colors border border-cream-200"
                >
                  <Plus className="w-4 h-4" />
                  Upload
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!aiPrompt.trim() || isGenerating}
                  className="flex-1 py-3 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Start'
                  )}
                </button>
              </div>

              {/* Enhanced by AI */}
              <div className="flex items-center justify-center gap-2 text-sm text-charcoal-light">
                <span>Enhanced by AI</span>
                <Info className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-6 border-b border-cream-200">
              <h2 className="text-xl font-semibold text-charcoal">Import from text</h2>
              <p className="text-sm text-charcoal-light mt-1">
                Paste your content with one card per line. Separate term and definition with a tab or dash.
              </p>
            </div>

            <div className="p-6">
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Term 1 - Definition 1
Term 2 - Definition 2
Or use tabs:
Term 1	Definition 1"
                className="w-full h-48 px-4 py-3 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <div className="p-6 border-t border-cream-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportText('');
                }}
                className="px-4 py-2 rounded-xl text-charcoal hover:bg-cream-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className="px-4 py-2 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors disabled:opacity-50"
              >
                Import
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
