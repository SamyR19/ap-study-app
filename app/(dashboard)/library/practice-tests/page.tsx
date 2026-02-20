'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  FileQuestion,
  Clock,
  MoreVertical,
  Trash2,
  Play,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PracticeTest } from '@/types/study-tools';

export default function PracticeTestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<PracticeTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    loadPracticeTests();
  }, []);

  const loadPracticeTests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('practice_tests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTests(data || []);
    } catch (error) {
      console.error('Error loading practice tests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this practice test?')) return;

    try {
      const { error } = await supabase
        .from('practice_tests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTests(tests.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting test:', error);
    }
    setOpenMenuId(null);
  };

  const filteredTests = tests.filter(test =>
    test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (test.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getQuestionCount = (test: PracticeTest) => {
    return test.questions?.length || 0;
  };

  const getQuestionTypes = (test: PracticeTest) => {
    const types = test.settings?.questionTypes || [];
    const labels = [];
    if (types.includes('mcq')) labels.push('MCQ');
    if (types.includes('frq')) labels.push('FRQ');
    return labels.join(' + ') || 'Mixed';
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
          <h1 className="text-2xl font-bold text-charcoal">Practice Tests</h1>
          <p className="text-charcoal-light">{tests.length} {tests.length === 1 ? 'test' : 'tests'}</p>
        </div>

        <button
          onClick={() => router.push('/create/practice-test')}
          className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Test
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-light" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search practice tests..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-charcoal-light"
        />
      </div>

      {/* Empty State */}
      {filteredTests.length === 0 && !searchQuery && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-cream-100 rounded-2xl flex items-center justify-center">
            <FileQuestion className="w-8 h-8 text-charcoal-light" />
          </div>
          <h3 className="text-lg font-semibold text-charcoal mb-2">No practice tests yet</h3>
          <p className="text-charcoal-light mb-6">Create your first practice test from your study materials</p>
          <button
            onClick={() => router.push('/create/practice-test')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Practice Test
          </button>
        </div>
      )}

      {/* No Results */}
      {filteredTests.length === 0 && searchQuery && (
        <div className="text-center py-16">
          <p className="text-charcoal-light">No results for &quot;{searchQuery}&quot;</p>
        </div>
      )}

      {/* Practice Tests Grid */}
      {filteredTests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-cream-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group relative"
              onClick={() => router.push(`/library/practice-tests/${test.id}`)}
            >
              {/* Card Header */}
              <div className="p-4 pb-0">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
                    <FileQuestion className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === test.id ? null : test.id);
                      }}
                      className="p-1 rounded-lg hover:bg-cream-100 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="w-5 h-5 text-charcoal-light" />
                    </button>

                    {/* Dropdown Menu */}
                    {openMenuId === test.id && (
                      <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-lg border border-cream-200 py-1 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/library/practice-tests/${test.id}?start=true`);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-left text-charcoal hover:bg-cream-50 transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          Take Test
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(test.id);
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

                <h3 className="font-semibold text-charcoal line-clamp-2 mb-1">{test.title}</h3>
                <div className="flex items-center gap-2 text-sm text-charcoal-light">
                  <span>{getQuestionCount(test)} questions</span>
                  <span>•</span>
                  <span>{getQuestionTypes(test)}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 py-3 mt-3 border-t border-cream-100 flex items-center justify-between text-sm">
                {test.settings?.timerMinutes && (
                  <div className="flex items-center gap-1 text-charcoal-light">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{test.settings.timerMinutes} min</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-charcoal-light ml-auto">
                  <span>{formatDate(test.created_at)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
