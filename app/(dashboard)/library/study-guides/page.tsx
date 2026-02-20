'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  BookOpen,
  Clock,
  MoreVertical,
  Trash2,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { StudyGuide } from '@/types/study-tools';

export default function StudyGuidesPage() {
  const router = useRouter();
  const [guides, setGuides] = useState<StudyGuide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    loadStudyGuides();
  }, []);

  const loadStudyGuides = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('study_guides')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGuides(data || []);
    } catch (error) {
      console.error('Error loading study guides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this study guide?')) return;

    try {
      const { error } = await supabase
        .from('study_guides')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setGuides(guides.filter(g => g.id !== id));
    } catch (error) {
      console.error('Error deleting guide:', error);
    }
    setOpenMenuId(null);
  };

  const filteredGuides = guides.filter(guide =>
    guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (guide.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getSectionCount = (guide: StudyGuide) => {
    return guide.outline_content?.sections?.length || 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Study Guides</h1>
          <p className="text-charcoal-light">{guides.length} {guides.length === 1 ? 'guide' : 'guides'}</p>
        </div>

        <button
          onClick={() => router.push('/create/study-guide')}
          className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Guide
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-light" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search study guides..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-charcoal-light"
        />
      </div>

      {/* Empty State */}
      {filteredGuides.length === 0 && !searchQuery && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-cream-100 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-charcoal-light" />
          </div>
          <h3 className="text-lg font-semibold text-charcoal mb-2">No study guides yet</h3>
          <p className="text-charcoal-light mb-6">Create your first study guide from your notes</p>
          <button
            onClick={() => router.push('/create/study-guide')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Study Guide
          </button>
        </div>
      )}

      {/* No Results */}
      {filteredGuides.length === 0 && searchQuery && (
        <div className="text-center py-16">
          <p className="text-charcoal-light">No results for &quot;{searchQuery}&quot;</p>
        </div>
      )}

      {/* Study Guides Grid */}
      {filteredGuides.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGuides.map((guide, index) => (
            <motion.div
              key={guide.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-cream-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group relative"
              onClick={() => router.push(`/library/study-guides/${guide.id}`)}
            >
              {/* Card Header */}
              <div className="p-4 pb-0">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-3">
                    <BookOpen className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === guide.id ? null : guide.id);
                      }}
                      className="p-1 rounded-lg hover:bg-cream-100 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="w-5 h-5 text-charcoal-light" />
                    </button>

                    {/* Dropdown Menu */}
                    {openMenuId === guide.id && (
                      <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-lg border border-cream-200 py-1 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(guide.id);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-charcoal line-clamp-2 mb-1">{guide.title}</h3>
                {guide.description && (
                  <p className="text-sm text-charcoal-light line-clamp-2">{guide.description}</p>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-4 py-3 mt-3 border-t border-cream-100 flex items-center justify-between text-sm">
                <span className="text-charcoal-light">{getSectionCount(guide)} sections</span>
                <div className="flex items-center gap-1 text-charcoal-light">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDate(guide.created_at)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
