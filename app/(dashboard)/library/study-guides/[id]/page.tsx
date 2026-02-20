'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  List,
  Zap,
  Layers,
  FileQuestion,
  Plus,
  User,
  Calendar,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { StudyGuide, StudyGuideSection, KeyTerm, CauseEffect } from '@/types/study-tools';

type TabType = 'outline' | 'quick-reference';

export default function StudyGuideDetailPage() {
  const router = useRouter();
  const params = useParams();
  const guideId = params.id as string;

  const [guide, setGuide] = useState<StudyGuide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('outline');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadGuideData();
  }, [guideId]);

  const loadGuideData = async () => {
    try {
      // Load guide
      const { data: guideData, error: guideError } = await supabase
        .from('study_guides')
        .select('*')
        .eq('id', guideId)
        .single();

      if (guideError) throw guideError;
      setGuide(guideData);

      // Load user name
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown');
      }
    } catch (error) {
      console.error('Error loading study guide:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="text-center py-16">
        <p className="text-charcoal-light">Study guide not found</p>
      </div>
    );
  }

  const sections: StudyGuideSection[] = guide.outline_content?.sections || [];
  const keyTerms: KeyTerm[] = guide.quick_reference?.keyTerms || [];
  const factsToMemorize: string[] = guide.quick_reference?.factsToMemorize || [];
  const causeEffect: CauseEffect[] = guide.quick_reference?.causeEffect || [];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/library?tab=study-guides')}
          className="flex items-center gap-2 text-charcoal-light hover:text-charcoal transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Study Guides
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-charcoal mb-2">{guide.title}</h1>
            <div className="flex items-center gap-4 text-sm text-charcoal-light">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {userName}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(guide.created_at)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-cream-200">
        <button
          onClick={() => setActiveTab('outline')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
            activeTab === 'outline'
              ? 'text-charcoal'
              : 'text-charcoal-light hover:text-charcoal'
          }`}
        >
          <List className="w-4 h-4" />
          Outline
          {activeTab === 'outline' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('quick-reference')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
            activeTab === 'quick-reference'
              ? 'text-charcoal'
              : 'text-charcoal-light hover:text-charcoal'
          }`}
        >
          <Zap className="w-4 h-4" />
          Quick reference
          {activeTab === 'quick-reference' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal"
            />
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'outline' ? (
        /* Document-style Outline */
        <div className="bg-white rounded-2xl border border-cream-200 p-8 mb-8">
          <div className="prose prose-charcoal max-w-none">
            {sections.map((section, index) => (
              <div key={index} className="mb-10 last:mb-0">
                {/* Section Title */}
                <h2 className="text-xl font-bold text-charcoal mb-4">
                  {index + 1}. {section.title}
                </h2>

                {/* Section Content */}
                {section.content && (
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-charcoal mb-3">
                      Overview of {section.title.replace(/^\d+\.\s*/, '')}
                    </h3>
                    <ul className="space-y-2">
                      {section.content.split('. ').filter(s => s.trim()).map((sentence, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-3 text-charcoal-light leading-relaxed">
                          <span className="text-charcoal-light mt-2">•</span>
                          <span>{sentence.trim()}{!sentence.endsWith('.') && '.'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Subsections */}
                {section.subsections && section.subsections.length > 0 && (
                  <div className="space-y-6">
                    {section.subsections.map((subsection, subIndex) => (
                      <div key={subIndex}>
                        <h3 className="text-base font-semibold text-charcoal mb-3">
                          {subsection.title}
                        </h3>
                        <ul className="space-y-2">
                          {subsection.content.split('. ').filter(s => s.trim()).map((sentence, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-3 text-charcoal-light leading-relaxed">
                              <span className="text-charcoal-light mt-2">•</span>
                              <span>{sentence.trim()}{!sentence.endsWith('.') && '.'}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Quick Reference */
        <div className="space-y-6 mb-8">
          {/* Key Terms */}
          {keyTerms.length > 0 && (
            <div className="bg-white rounded-2xl border border-cream-200 p-8">
              <h3 className="text-lg font-bold text-charcoal mb-6">Key Terms</h3>
              <div className="space-y-4">
                {keyTerms.map((item, index) => (
                  <div key={index} className="pb-4 border-b border-cream-100 last:border-0 last:pb-0">
                    <p className="font-semibold text-charcoal mb-1">{item.term}</p>
                    <p className="text-charcoal-light leading-relaxed">{item.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Facts to Memorize */}
          {factsToMemorize.length > 0 && (
            <div className="bg-white rounded-2xl border border-cream-200 p-8">
              <h3 className="text-lg font-bold text-charcoal mb-6">Facts to Memorize</h3>
              <ul className="space-y-3">
                {factsToMemorize.map((fact, index) => (
                  <li key={index} className="flex items-start gap-3 text-charcoal-light leading-relaxed">
                    <span className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cause & Effect */}
          {causeEffect.length > 0 && (
            <div className="bg-white rounded-2xl border border-cream-200 p-8">
              <h3 className="text-lg font-bold text-charcoal mb-6">Cause & Effect</h3>
              <div className="space-y-4">
                {causeEffect.map((item, index) => (
                  <div key={index} className="grid grid-cols-2 gap-6 pb-4 border-b border-cream-100 last:border-0 last:pb-0">
                    <div>
                      <p className="text-xs font-semibold text-charcoal-light uppercase tracking-wide mb-2">Cause</p>
                      <p className="text-charcoal leading-relaxed">{item.cause}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-charcoal-light uppercase tracking-wide mb-2">Effect</p>
                      <p className="text-charcoal leading-relaxed">{item.effect}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Study This Material Section */}
      <div className="bg-cream-100 rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-charcoal mb-4">Study this material</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => router.push(`/create/flashcards?source=guide&id=${guideId}`)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-charcoal hover:bg-cream-50 transition-colors border border-cream-200"
          >
            <Layers className="w-4 h-4" />
            Flashcards
          </button>
          <button
            onClick={() => router.push(`/create/practice-test?source=guide&id=${guideId}`)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-charcoal hover:bg-cream-50 transition-colors border border-cream-200"
          >
            <FileQuestion className="w-4 h-4" />
            Practice questions
          </button>
        </div>
      </div>

      {/* Generate Another Button */}
      <button
        onClick={() => router.push('/create/study-guide')}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-cream-300 rounded-xl text-charcoal-light hover:text-charcoal hover:border-charcoal-light transition-colors"
      >
        <Plus className="w-5 h-5" />
        Generate another study guide
      </button>
    </div>
  );
}
