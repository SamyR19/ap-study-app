'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import {
  MoreHorizontal,
  X,
  Loader2,
  Link2,
  Check,
  Search,
  UserPlus,
  Folder,
  Trash2,
  LogOut,
  Trophy,
  Zap,
  Play,
  Users,
  Sparkles,
  Clock,
  Crown,
  Circle,
  ArrowLeft,
  ExternalLink,
  BarChart3,
  Target,
  History,
} from 'lucide-react';
import { useQuizInvitations, QuizInvitation } from '@/lib/use-quiz-invitations';
import { QuizInvitationContainer } from '@/components/quiz/QuizInvitationAlert';

const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseKey);
};

interface GroupMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile: {
    username: string;
    avatar_url: string | null;
  };
  // For leaderboard
  stats?: {
    cardsStudied: number;
    quizzesTaken: number;
    correctAnswers: number;
    studyStreak: number;
    totalPoints: number;
    isOnline: boolean;
    lastActive: string;
  };
}

interface LiveQuiz {
  id: string;
  hostId: string;
  hostName: string;
  status: 'waiting' | 'in_progress' | 'finished';
  participants: string[];
  totalQuestions: number;
  currentQuestion: number;
  sourceType: 'flashcards' | 'ai';
  sourceName: string;
}

interface SavedQuiz {
  id: string;
  title: string;
  sourceType: 'flashcards' | 'ai';
  questionCount: number;
  questionType: 'mcq' | 'frq' | 'mixed';
  totalPlays: number;
  createdAt: string;
  createdBy: string;
  bestScore?: number;
  lastPlayedAt?: string;
}

interface GroupSet {
  id: string;
  set_id: string;
  added_at: string;
  flashcard_set: {
    id: string;
    title: string;
    card_count: number;
    user_id: string;
  };
  added_by_profile: {
    username: string;
  };
}

interface FlashcardSet {
  id: string;
  title: string;
  card_count: number;
  user_id: string;
}

interface StudyGroup {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  creator_id: string;
  max_members: number;
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;

  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [sets, setSets] = useState<GroupSet[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'materials' | 'members'>('materials');
  const [showAddSetModal, setShowAddSetModal] = useState(false);
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [activeQuizzes, setActiveQuizzes] = useState<LiveQuiz[]>([]);
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>([]);
  const [quizSourceType, setQuizSourceType] = useState<'flashcards' | 'ai'>('flashcards');
  const [selectedQuizSet, setSelectedQuizSet] = useState<string | null>(null);
  const [quizPrompt, setQuizPrompt] = useState('');
  const [quizQuestionCount, setQuizQuestionCount] = useState(10);
  const [quizTimePerQuestion, setQuizTimePerQuestion] = useState(15);
  const [quizPointsPerQuestion, setQuizPointsPerQuestion] = useState(100);
  const [quizSpeedBonus, setQuizSpeedBonus] = useState(true);
  const [quizUnits, setQuizUnits] = useState('');
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userSets, setUserSets] = useState<FlashcardSet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSets, setSelectedSets] = useState<string[]>([]);
  const [isAddingSets, setIsAddingSets] = useState(false);
  const [quizQuestionTypes, setQuizQuestionTypes] = useState<('mcq' | 'frq')[]>(['mcq']);
  const [pendingQuiz, setPendingQuiz] = useState<{
    quizId: string;
    waitingForPlayers: boolean;
    countdown: number;
    config: {
      sourceType: 'flashcards' | 'ai';
      prompt: string;
      setId: string | null;
      questionCount: number;
      timePerQuestion: number;
      pointsPerQuestion: number;
      speedBonus: boolean;
      questionTypes: ('mcq' | 'frq')[];
      units: string;
    };
  } | null>(null);

  // Quiz invitation system
  const handleInvitationReceived = useCallback((invitation: QuizInvitation) => {
    // Play notification sound or show toast
    console.log('Quiz invitation received:', invitation);
  }, []);

  const {
    isConnected: invitationsConnected,
    activeInvitations,
    broadcastInvitation,
    joinQuiz,
    dismissInvitation,
    broadcastQuizStarted,
  } = useQuizInvitations({
    groupId,
    userId: currentUser?.id || '',
    onInvitation: handleInvitationReceived,
  });

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      setCurrentUser({ id: user.id, username: profileData?.username || 'Unknown' });

      // Get group info
      const { data: groupData, error: groupError } = await supabase
        .from('study_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError || !groupData) {
        router.push('/study-groups');
        return;
      }

      setGroup(groupData);

      // Get members with profiles
      const { data: membersData } = await supabase
        .from('study_group_members')
        .select(`
          id,
          user_id,
          role,
          joined_at
        `)
        .eq('group_id', groupId);

      if (membersData) {
        // Fetch profiles and stats for each member
        const membersWithProfiles = await Promise.all(
          membersData.map(async (member) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', member.user_id)
              .single();

            // Generate mock stats for now (would come from activity tracking)
            // In production, this would query actual study activity tables
            const mockStats = {
              cardsStudied: Math.floor(Math.random() * 500) + 50,
              quizzesTaken: Math.floor(Math.random() * 20),
              correctAnswers: Math.floor(Math.random() * 200) + 20,
              studyStreak: Math.floor(Math.random() * 14),
              totalPoints: Math.floor(Math.random() * 5000) + 100,
              isOnline: Math.random() > 0.6, // Simulate online status
              lastActive: new Date(Date.now() - Math.random() * 3600000).toISOString(),
            };

            return {
              ...member,
              profile: profile || { username: 'Unknown', avatar_url: null },
              stats: mockStats,
            };
          })
        );

        // Sort by total points for leaderboard
        membersWithProfiles.sort((a, b) => (b.stats?.totalPoints || 0) - (a.stats?.totalPoints || 0));
        setMembers(membersWithProfiles);
      }

      // Get sets in group
      const { data: setsData } = await supabase
        .from('study_group_sets')
        .select(`
          id,
          set_id,
          added_at,
          added_by
        `)
        .eq('group_id', groupId);

      if (setsData && setsData.length > 0) {
        // Fetch flashcard set details and added_by profile for each
        const setsWithDetails = await Promise.all(
          setsData.map(async (setItem) => {
            const { data: flashcardSet } = await supabase
              .from('flashcard_sets')
              .select('id, title, card_count, user_id')
              .eq('id', setItem.set_id)
              .single();

            const { data: addedByProfile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', setItem.added_by)
              .single();

            return {
              ...setItem,
              flashcard_set: flashcardSet || { id: '', title: 'Unknown', card_count: 0, user_id: '' },
              added_by_profile: addedByProfile || { username: 'Unknown' }
            };
          })
        );

        setSets(setsWithDetails);
      }

      // Get ALL flashcard sets (for add set modal) - both user's own and public/shared
      const { data: allSetsData } = await supabase
        .from('flashcard_sets')
        .select('id, title, card_count, user_id')
        .order('updated_at', { ascending: false });

      setUserSets(allSetsData || []);

      // Load saved quizzes for this group (mock data for now)
      // In production, this would fetch from live_quizzes table
      const mockSavedQuizzes: SavedQuiz[] = [
        {
          id: 'saved_1',
          title: 'Java Basics Quiz',
          sourceType: 'flashcards',
          questionCount: 10,
          questionType: 'mcq',
          totalPlays: 5,
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          createdBy: profileData?.username || 'Unknown',
          bestScore: 850,
          lastPlayedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'saved_2',
          title: 'OOP Concepts Challenge',
          sourceType: 'ai',
          questionCount: 15,
          questionType: 'mixed',
          totalPlays: 3,
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          createdBy: 'Alex',
          bestScore: 1200,
        },
        {
          id: 'saved_3',
          title: 'Arrays & ArrayLists',
          sourceType: 'flashcards',
          questionCount: 8,
          questionType: 'frq',
          totalPlays: 2,
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
          createdBy: 'Jordan',
        },
      ];
      setSavedQuizzes(mockSavedQuizzes);
    } catch (err) {
      console.error('Error loading group:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!group) return;

    const inviteUrl = `${window.location.origin}/join/${group.invite_code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddSets = async () => {
    if (selectedSets.length === 0) return;

    setIsAddingSets(true);

    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      for (const setId of selectedSets) {
        await supabase
          .from('study_group_sets')
          .insert({
            group_id: groupId,
            set_id: setId,
            added_by: user.id,
          });
      }

      // Reload data
      await loadGroupData();
      setShowAddSetModal(false);
      setSelectedSets([]);
    } catch (err) {
      console.error('Error adding sets:', err);
    } finally {
      setIsAddingSets(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!currentUser) return;

    try {
      const supabase = getSupabase();

      await supabase
        .from('study_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', currentUser.id);

      router.push('/study-groups');
    } catch (err) {
      console.error('Error leaving group:', err);
    }
  };

  const handleDeleteGroup = async () => {
    if (!group || !currentUser || currentUser.id !== group.creator_id) return;

    try {
      const supabase = getSupabase();

      await supabase
        .from('study_groups')
        .delete()
        .eq('id', groupId);

      router.push('/study-groups');
    } catch (err) {
      console.error('Error deleting group:', err);
    }
  };

  const handleRemoveSet = async (setRecordId: string) => {
    try {
      const supabase = getSupabase();

      await supabase
        .from('study_group_sets')
        .delete()
        .eq('id', setRecordId);

      await loadGroupData();
    } catch (err) {
      console.error('Error removing set:', err);
    }
  };

  const handleCreateQuiz = async () => {
    if (quizSourceType === 'flashcards' && !selectedQuizSet) return;
    if (quizSourceType === 'ai' && !quizPrompt.trim()) return;

    setIsCreatingQuiz(true);

    try {
      // Create a new live quiz session
      const sourceName = quizSourceType === 'flashcards'
        ? sets.find(s => s.set_id === selectedQuizSet)?.flashcard_set.title || 'Unknown Set'
        : quizPrompt.slice(0, 50);

      const quizId = `quiz_${Date.now()}`;

      const newQuiz: LiveQuiz = {
        id: quizId,
        hostId: currentUser?.id || '',
        hostName: currentUser?.username || 'Unknown',
        status: 'waiting',
        participants: [currentUser?.id || ''],
        totalQuestions: quizQuestionCount,
        currentQuestion: 0,
        sourceType: quizSourceType,
        sourceName,
      };

      setActiveQuizzes(prev => [...prev, newQuiz]);
      setShowCreateQuizModal(false);

      // Broadcast invitation to all active users in the group
      if (invitationsConnected && group) {
        await broadcastInvitation({
          id: `inv_${quizId}`,
          quizId,
          hostId: currentUser?.id || '',
          hostName: currentUser?.username || 'Unknown',
          groupId,
          groupName: group.name,
          title: sourceName,
          questionCount: quizQuestionCount,
          questionTypes: quizQuestionTypes,
          timePerQuestion: quizTimePerQuestion,
        });
      }

      // Set pending quiz - wait for players to join
      setPendingQuiz({
        quizId,
        waitingForPlayers: true,
        countdown: 15, // 15 seconds to wait for players
        config: {
          sourceType: quizSourceType,
          prompt: quizPrompt,
          setId: selectedQuizSet,
          questionCount: quizQuestionCount,
          timePerQuestion: quizTimePerQuestion,
          pointsPerQuestion: quizPointsPerQuestion,
          speedBonus: quizSpeedBonus,
          questionTypes: quizQuestionTypes,
          units: quizUnits,
        },
      });

      // Reset form
      setSelectedQuizSet(null);
      setQuizPrompt('');
      setQuizQuestionCount(10);
      setQuizTimePerQuestion(15);
      setQuizPointsPerQuestion(100);
      setQuizSpeedBonus(true);
      setQuizUnits('');
      setQuizQuestionTypes(['mcq']);

    } catch (err) {
      console.error('Error creating quiz:', err);
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  // Build quiz URL with config params
  const buildQuizUrl = useCallback((quizId: string, config: {
    sourceType: 'flashcards' | 'ai';
    prompt: string;
    setId: string | null;
    questionCount: number;
    timePerQuestion: number;
    pointsPerQuestion: number;
    speedBonus: boolean;
    questionTypes: ('mcq' | 'frq')[];
    units: string;
  }) => {
    const params = new URLSearchParams();
    params.set('source', config.sourceType);
    if (config.prompt) params.set('prompt', config.prompt);
    if (config.setId) params.set('setId', config.setId);
    params.set('count', String(config.questionCount));
    params.set('time', String(config.timePerQuestion));
    params.set('points', String(config.pointsPerQuestion));
    params.set('speedBonus', String(config.speedBonus));
    params.set('types', config.questionTypes.join(','));
    if (config.units) params.set('units', config.units);

    return `/study-groups/${groupId}/quiz/${quizId}?${params.toString()}`;
  }, [groupId]);

  // Handle countdown for pending quiz
  useEffect(() => {
    if (!pendingQuiz) return;

    const timer = setInterval(() => {
      setPendingQuiz(prev => {
        if (!prev) return null;

        if (prev.countdown <= 1) {
          // Time's up - start the quiz (solo or with whoever joined)
          clearInterval(timer);
          broadcastQuizStarted(prev.quizId);
          const quizUrl = buildQuizUrl(prev.quizId, prev.config);
          router.push(quizUrl);
          return null;
        }

        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pendingQuiz, router, broadcastQuizStarted, buildQuizUrl]);

  // Start quiz immediately (skip waiting)
  const handleStartQuizNow = () => {
    if (!pendingQuiz) return;
    broadcastQuizStarted(pendingQuiz.quizId);
    const quizUrl = buildQuizUrl(pendingQuiz.quizId, pendingQuiz.config);
    router.push(quizUrl);
    setPendingQuiz(null);
  };

  // Cancel pending quiz
  const handleCancelPendingQuiz = () => {
    if (!pendingQuiz) return;
    setActiveQuizzes(prev => prev.filter(q => q.id !== pendingQuiz.quizId));
    setPendingQuiz(null);
  };

  // Handle joining a quiz from invitation
  const handleJoinFromInvitation = async (quizId: string) => {
    await joinQuiz(quizId, currentUser?.username || 'Unknown');
    // Find the invitation to get the config
    const invitation = activeInvitations.find(inv => inv.quizId === quizId);
    if (invitation) {
      const params = new URLSearchParams();
      params.set('source', 'ai'); // Default to AI since we don't have the full source info
      params.set('count', String(invitation.questionCount));
      params.set('time', String(invitation.timePerQuestion));
      params.set('types', invitation.questionTypes.join(','));
      router.push(`/study-groups/${groupId}/quiz/${quizId}?${params.toString()}`);
    } else {
      router.push(`/study-groups/${groupId}/quiz/${quizId}`);
    }
  };

  const handleJoinQuiz = (quizId: string) => {
    setActiveQuizzes(prev =>
      prev.map(q =>
        q.id === quizId
          ? { ...q, participants: [...q.participants, currentUser?.id || ''] }
          : q
      )
    );
  };

  const handleStartQuiz = (quizId: string) => {
    setActiveQuizzes(prev =>
      prev.map(q =>
        q.id === quizId
          ? { ...q, status: 'in_progress' }
          : q
      )
    );
  };

  const filteredUserSets = userSets.filter(set =>
    set.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sets already in the group
  const existingSetIds = sets.map(s => s.set_id);
  const availableSets = filteredUserSets.filter(s => !existingSetIds.includes(s.id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-light" />
      </div>
    );
  }

  if (!group) {
    return null;
  }

  const isAdmin = currentUser && members.some(m => m.user_id === currentUser.id && m.role === 'admin');

  return (
    <>
      <div className="px-2">
        {/* Back Button */}
        <button
          onClick={() => router.push('/study-groups')}
          className="flex items-center gap-2 text-charcoal-light hover:text-charcoal transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Study Groups</span>
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-charcoal">{group.name}</h1>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddSetModal(true)}
              className="px-4 py-2.5 border-2 border-charcoal rounded-xl font-medium text-charcoal hover:bg-cream-50 transition-colors"
            >
              Add a set
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-cream-300 hover:bg-cream-50 transition-colors"
              >
                <MoreHorizontal className="w-5 h-5 text-charcoal-light" />
              </button>

              {/* More Menu Dropdown */}
              <AnimatePresence>
                {showMoreMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-cream-200 overflow-hidden z-20"
                  >
                    <button
                      onClick={() => {
                        handleLeaveGroup();
                        setShowMoreMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-charcoal hover:bg-cream-50 flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4" />
                      Leave group
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          handleDeleteGroup();
                          setShowMoreMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-red-500 hover:bg-red-50 flex items-center gap-3"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete group
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-cream-200 mb-6">
          <div className="flex gap-6">
            {[
              { id: 'materials', label: 'Materials' },
              { id: 'members', label: 'Members' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`pb-3 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-charcoal'
                    : 'text-charcoal-light hover:text-charcoal'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'materials' ? (
            <motion.div
              key="materials"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {sets.length === 0 ? (
                /* Empty State for Materials */
                <div className="py-8">
                  <div className="flex flex-col items-start">
                    {/* Illustration */}
                    <div className="relative mb-6">
                      <div className="w-24 h-28 bg-primary-200 rounded-xl transform -rotate-6" />
                      <div className="absolute top-2 left-4 w-24 h-28 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center p-4">
                        <div className="w-12 h-1.5 bg-cream-200 rounded-full mb-2" />
                        <div className="w-8 h-1.5 bg-cream-200 rounded-full mb-4" />
                        <div className="w-10 h-10 bg-yellow-200 rounded-full" />
                      </div>
                    </div>

                    <h2 className="text-xl font-bold text-charcoal mb-2">
                      Add sets to your group
                    </h2>
                    <p className="text-charcoal-light mb-4">
                      Share flashcard sets with your study group members
                    </p>

                    <button
                      onClick={() => setShowAddSetModal(true)}
                      className="px-6 py-3 text-primary-500 font-medium hover:underline transition-colors"
                    >
                      Add sets
                    </button>
                  </div>
                </div>
              ) : (
                /* Sets List */
                <div className="space-y-3">
                  {sets.map((setItem) => (
                    <div
                      key={setItem.id}
                      className="flex items-center justify-between p-4 bg-cream-50 rounded-xl hover:bg-cream-100 transition-colors group"
                    >
                      <button
                        onClick={() => router.push(`/library/study-sets/${setItem.flashcard_set.id}`)}
                        className="flex items-center gap-4 flex-1 text-left"
                      >
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                          <Folder className="w-6 h-6 text-primary-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-charcoal flex items-center gap-2">
                            {setItem.flashcard_set.title}
                            <ExternalLink className="w-4 h-4 text-charcoal-light opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h3>
                          <p className="text-sm text-charcoal-light">
                            Flashcard set &middot; {setItem.flashcard_set.card_count} terms &middot; by {setItem.added_by_profile.username}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSet(setItem.id);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cream-200 transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5 text-charcoal-light" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Members Count */}
              <p className="text-charcoal-light mb-4">
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </p>

              {/* Invite Section */}
              <div className="flex items-center justify-between p-4 bg-cream-50 rounded-xl mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cream-200 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-charcoal-light" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">
                      Invite members by sharing the link ({group.max_members} max)
                    </p>
                    <p className="text-sm text-charcoal-light">
                      By inviting other users, your information will be visible to those who have accepted your invite.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      Copy link
                    </>
                  )}
                </button>
              </div>

              {/* Members List */}
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 hover:bg-cream-50 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          {member.profile.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={member.profile.avatar_url}
                              alt={member.profile.username}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-medium text-primary-600">
                              {member.profile.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        {/* Online indicator */}
                        {member.stats?.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-charcoal flex items-center gap-2">
                          {member.profile.username}
                          {member.user_id === currentUser?.id && (
                            <span className="text-charcoal-light"> (You)</span>
                          )}
                          {member.stats?.isOnline && (
                            <span className="text-xs text-green-500 font-medium">Online</span>
                          )}
                        </p>
                        {member.role === 'admin' && (
                          <span className="text-xs text-primary-500 font-medium">Admin</span>
                        )}
                      </div>
                    </div>

                    {isAdmin && member.user_id !== currentUser?.id && (
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cream-100 transition-colors">
                        <MoreHorizontal className="w-5 h-5 text-charcoal-light" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Leaderboard Section - always visible on materials tab */}
        {activeTab === 'materials' && (
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-bold text-charcoal">Leaderboard</h2>
            </div>

            {/* Top 3 */}
            {members.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                {members.slice(0, 3).map((member, index) => (
                  <div
                    key={member.id}
                    className={`text-center p-6 rounded-2xl ${
                      index === 0
                        ? 'bg-gradient-to-b from-yellow-50 to-yellow-100 border-2 border-yellow-200'
                        : index === 1
                        ? 'bg-gradient-to-b from-slate-50 to-slate-100 border-2 border-slate-200'
                        : 'bg-gradient-to-b from-amber-50 to-amber-100 border-2 border-amber-200'
                    }`}
                  >
                    <div className="relative inline-block mb-3">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                        {member.profile.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={member.profile.avatar_url}
                            alt={member.profile.username}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-primary-600">
                            {member.profile.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {index === 0 && (
                        <Crown className="w-6 h-6 text-yellow-500 absolute -top-2 left-1/2 -translate-x-1/2" />
                      )}
                      <span className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-slate-300 text-slate-700' :
                        'bg-amber-400 text-amber-900'
                      }`}>
                        {index + 1}
                      </span>
                    </div>
                    <p className="font-semibold text-charcoal truncate">{member.profile.username}</p>
                    <p className="text-2xl font-bold text-charcoal mt-1">{member.stats?.totalPoints.toLocaleString()}</p>
                    <p className="text-xs text-charcoal-light">points</p>
                  </div>
                ))}
              </div>
            )}

            {/* Full Leaderboard Table */}
            <div className="bg-white rounded-xl border border-cream-200 overflow-hidden">
              <div className="grid grid-cols-12 gap-2 p-4 bg-cream-50 text-xs font-medium text-charcoal-light uppercase">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Member</div>
                <div className="col-span-2 text-center">Cards</div>
                <div className="col-span-2 text-center">Quizzes</div>
                <div className="col-span-1 text-center">Streak</div>
                <div className="col-span-2 text-right">Points</div>
              </div>
              <div className="divide-y divide-cream-100">
                {members.map((member, index) => (
                  <div
                    key={member.id}
                    className={`grid grid-cols-12 gap-2 p-4 items-center ${
                      member.user_id === currentUser?.id ? 'bg-primary-50' : 'hover:bg-cream-50'
                    }`}
                  >
                    <div className="col-span-1">
                      <span className={`font-bold ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-slate-400' :
                        index === 2 ? 'text-amber-500' :
                        'text-charcoal-light'
                      }`}>
                        {index + 1}
                      </span>
                    </div>
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {member.profile.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {member.stats?.isOnline && (
                          <Circle className="w-2.5 h-2.5 text-green-500 fill-green-500 absolute -bottom-0.5 -right-0.5" />
                        )}
                      </div>
                      <span className="font-medium text-charcoal truncate">
                        {member.profile.username}
                        {member.user_id === currentUser?.id && ' (You)'}
                      </span>
                    </div>
                    <div className="col-span-2 text-center text-charcoal">{member.stats?.cardsStudied}</div>
                    <div className="col-span-2 text-center text-charcoal">{member.stats?.quizzesTaken}</div>
                    <div className="col-span-1 text-center">
                      <span className="text-charcoal">{member.stats?.studyStreak}</span>
                      <span className="text-xs">🔥</span>
                    </div>
                    <div className="col-span-2 text-right font-bold text-charcoal">
                      {member.stats?.totalPoints.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quiz Invitations from other users */}
        {activeTab === 'materials' && activeInvitations.length > 0 && (
          <div className="mt-6">
            <QuizInvitationContainer
              invitations={activeInvitations}
              onJoin={handleJoinFromInvitation}
              onDismiss={dismissInvitation}
            />
          </div>
        )}

        {/* Pending Quiz - Waiting for players */}
        {activeTab === 'materials' && pendingQuiz && (
          <div className="mt-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Waiting for players...</h3>
                    <p className="text-white/80">
                      Quiz will start automatically in {pendingQuiz.countdown} seconds, or start now if you&apos;re ready.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-white">{pendingQuiz.countdown}</span>
                    <p className="text-white/60 text-sm">seconds</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelPendingQuiz}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStartQuizNow}
                      className="px-4 py-2 bg-white text-green-600 rounded-lg font-bold hover:bg-white/90 transition-colors"
                    >
                      Start Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Show who's joined */}
              {activeQuizzes.find(q => q.id === pendingQuiz.quizId)?.participants && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-white/80 text-sm">Players joined:</span>
                  <div className="flex -space-x-2">
                    {activeQuizzes.find(q => q.id === pendingQuiz.quizId)?.participants.map((pId, idx) => {
                      const member = members.find(m => m.user_id === pId);
                      return (
                        <div
                          key={pId}
                          className="w-8 h-8 rounded-full bg-white/20 border-2 border-white flex items-center justify-center"
                          style={{ zIndex: 10 - idx }}
                        >
                          <span className="text-xs font-medium text-white">
                            {member?.profile.username.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-white font-medium">
                    {activeQuizzes.find(q => q.id === pendingQuiz.quizId)?.participants.length || 1}
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Live Quiz Section - always visible on materials tab */}
        {activeTab === 'materials' && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-primary-500" />
                <div>
                  <h2 className="text-xl font-bold text-charcoal">Live Quizzes</h2>
                  <p className="text-sm text-charcoal-light">Challenge your study group in real-time</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateQuizModal(true)}
                disabled={!!pendingQuiz}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4" />
                Start Quiz
              </button>
            </div>

            {/* Active Quizzes */}
            {activeQuizzes.length > 0 ? (
              <div className="space-y-4">
                {activeQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="bg-white rounded-xl border-2 border-cream-200 p-5 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          quiz.status === 'waiting' ? 'bg-yellow-100' :
                          quiz.status === 'in_progress' ? 'bg-green-100' :
                          'bg-cream-100'
                        }`}>
                          {quiz.status === 'waiting' ? (
                            <Clock className="w-6 h-6 text-yellow-600" />
                          ) : quiz.status === 'in_progress' ? (
                            <Zap className="w-6 h-6 text-green-600" />
                          ) : (
                            <Trophy className="w-6 h-6 text-charcoal-light" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-charcoal">
                              {quiz.sourceType === 'ai' ? 'AI Quiz' : quiz.sourceName}
                            </h3>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              quiz.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                              quiz.status === 'in_progress' ? 'bg-green-100 text-green-700' :
                              'bg-cream-100 text-charcoal-light'
                            }`}>
                              {quiz.status === 'waiting' ? 'Waiting' :
                               quiz.status === 'in_progress' ? 'In Progress' : 'Finished'}
                            </span>
                          </div>
                          <p className="text-sm text-charcoal-light">
                            Hosted by {quiz.hostName} • {quiz.totalQuestions} questions
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-sm text-charcoal-light">
                          <Users className="w-4 h-4" />
                          {quiz.participants.length}
                        </div>

                        {quiz.status === 'waiting' && quiz.hostId === currentUser?.id && (
                          <button
                            onClick={() => handleStartQuiz(quiz.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                          >
                            <Play className="w-4 h-4" />
                            Start
                          </button>
                        )}

                        {quiz.status === 'waiting' && quiz.hostId !== currentUser?.id && !quiz.participants.includes(currentUser?.id || '') && (
                          <button
                            onClick={() => handleJoinQuiz(quiz.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-lg font-medium hover:bg-charcoal/90 transition-colors"
                          >
                            Join
                          </button>
                        )}

                        {quiz.status === 'in_progress' && (
                          <button
                            onClick={() => router.push(`/study-groups/${groupId}/quiz/${quiz.id}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                          >
                            Enter Quiz
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Participants preview */}
                    {quiz.participants.length > 0 && (
                      <div className="mt-4 flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {quiz.participants.slice(0, 5).map((pId, idx) => {
                            const participant = members.find(m => m.user_id === pId);
                            return (
                              <div
                                key={pId}
                                className="w-8 h-8 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center"
                                style={{ zIndex: 5 - idx }}
                              >
                                <span className="text-xs font-medium text-primary-600">
                                  {participant?.profile.username.charAt(0).toUpperCase() || '?'}
                                </span>
                              </div>
                            );
                          })}
                          {quiz.participants.length > 5 && (
                            <div className="w-8 h-8 rounded-full bg-cream-200 border-2 border-white flex items-center justify-center">
                              <span className="text-xs font-medium text-charcoal-light">
                                +{quiz.participants.length - 5}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-charcoal-light">
                          {quiz.participants.length === 1 ? '1 player ready' : `${quiz.participants.length} players ready`}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-12 bg-cream-50 rounded-2xl">
                <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-10 h-10 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">No active quizzes</h3>
                <p className="text-charcoal-light mb-6 max-w-md mx-auto">
                  Start a live quiz to compete with your study group members in real-time!
                </p>
                <button
                  onClick={() => setShowCreateQuizModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  Create First Quiz
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quiz History Section - always visible on materials tab */}
        {activeTab === 'materials' && savedQuizzes.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-6">
              <History className="w-6 h-6 text-charcoal-light" />
              <div>
                <h2 className="text-xl font-bold text-charcoal">Quiz History</h2>
                <p className="text-sm text-charcoal-light">Replay saved quizzes anytime</p>
              </div>
            </div>

            <div className="space-y-3">
              {savedQuizzes.map((quiz, index) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-cream-200 p-4 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-charcoal">{quiz.title}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          quiz.questionType === 'mcq'
                            ? 'bg-blue-100 text-blue-700'
                            : quiz.questionType === 'frq'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {quiz.questionType.toUpperCase()}
                        </span>
                        {quiz.sourceType === 'ai' && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
                            AI Generated
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-charcoal-light">
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {quiz.questionCount} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {quiz.totalPlays} plays
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(quiz.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        {quiz.bestScore !== undefined && (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <Trophy className="w-4 h-4" />
                            Best: {quiz.bestScore.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // View analytics - could open a modal
                          console.log('View analytics for', quiz.id);
                        }}
                        className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
                        title="View Analytics"
                      >
                        <BarChart3 className="w-5 h-5 text-charcoal-light" />
                      </button>
                      <button
                        onClick={() => router.push(`/study-groups/${groupId}/quiz/${quiz.id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Play
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Set Modal */}
      <AnimatePresence>
        {showAddSetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddSetModal(false);
                setSearchQuery('');
                setSelectedSets([]);
              }}
              className="absolute inset-0 bg-black/50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowAddSetModal(false);
                  setSearchQuery('');
                  setSelectedSets([]);
                }}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-100 transition-colors z-10"
              >
                <X className="w-5 h-5 text-charcoal-light" />
              </button>

              <div className="p-6 pb-4">
                <h2 className="text-2xl font-bold text-charcoal mb-6">Add a set</h2>

                {/* Search and Label */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-charcoal-light font-medium">Your sets</span>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search your sets"
                      className="pl-9 pr-4 py-2 border-2 border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Sets List */}
              <div className="flex-1 overflow-y-auto px-6">
                {userSets.length === 0 ? (
                  <div className="text-center py-12">
                    <Folder className="w-12 h-12 text-cream-300 mx-auto mb-4" />
                    <p className="text-charcoal-light mb-2">No sets created yet</p>
                    <p className="text-sm text-charcoal-light/70">
                      Create flashcard sets to add them to your study group
                    </p>
                  </div>
                ) : availableSets.length === 0 ? (
                  <div className="text-center py-12">
                    <Check className="w-12 h-12 text-green-300 mx-auto mb-4" />
                    <p className="text-charcoal-light">
                      {searchQuery ? 'No matching sets found' : 'All your sets are already added'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 pb-4">
                    {availableSets.map((set) => (
                      <button
                        key={set.id}
                        onClick={() => {
                          setSelectedSets(prev =>
                            prev.includes(set.id)
                              ? prev.filter(id => id !== set.id)
                              : [...prev, set.id]
                          );
                        }}
                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                          selectedSets.includes(set.id)
                            ? 'bg-primary-50 border-2 border-primary-500'
                            : 'hover:bg-cream-50 border-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Folder className="w-5 h-5 text-primary-500" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-charcoal">{set.title}</p>
                            <p className="text-sm text-charcoal-light">
                              {set.card_count} terms &middot; by you
                            </p>
                          </div>
                        </div>

                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedSets.includes(set.id)
                            ? 'bg-primary-500 border-primary-500'
                            : 'border-cream-300'
                        }`}>
                          {selectedSets.includes(set.id) && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 pt-4 border-t border-cream-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddSetModal(false);
                    setSearchQuery('');
                    setSelectedSets([]);
                  }}
                  className="px-5 py-2.5 border-2 border-cream-300 rounded-xl font-medium text-charcoal hover:bg-cream-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSets}
                  disabled={selectedSets.length === 0 || isAddingSets}
                  className="px-5 py-2.5 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isAddingSets ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Quiz Modal */}
      <AnimatePresence>
        {showCreateQuizModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateQuizModal(false)}
              className="absolute inset-0 bg-black/50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setShowCreateQuizModal(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-100 transition-colors z-10"
              >
                <X className="w-5 h-5 text-charcoal-light" />
              </button>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-charcoal">Start Live Quiz</h2>
                    <p className="text-sm text-charcoal-light">Challenge your group in real-time</p>
                  </div>
                </div>

                {/* Source Type Toggle */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-charcoal mb-2">Quiz Source</label>
                  <div className="flex gap-2 p-1 bg-cream-100 rounded-xl">
                    <button
                      onClick={() => setQuizSourceType('flashcards')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                        quizSourceType === 'flashcards'
                          ? 'bg-white text-charcoal shadow-sm'
                          : 'text-charcoal-light hover:text-charcoal'
                      }`}
                    >
                      <Folder className="w-4 h-4" />
                      From Study Set
                    </button>
                    <button
                      onClick={() => setQuizSourceType('ai')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                        quizSourceType === 'ai'
                          ? 'bg-white text-charcoal shadow-sm'
                          : 'text-charcoal-light hover:text-charcoal'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      AI Generated
                    </button>
                  </div>
                </div>

                {/* Flashcard Set Selection */}
                {quizSourceType === 'flashcards' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-charcoal mb-2">Select Study Set</label>
                    {sets.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {sets.map((setItem) => (
                          <button
                            key={setItem.set_id}
                            onClick={() => setSelectedQuizSet(setItem.set_id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                              selectedQuizSet === setItem.set_id
                                ? 'bg-primary-50 border-2 border-primary-500'
                                : 'bg-cream-50 hover:bg-cream-100 border-2 border-transparent'
                            }`}
                          >
                            <Folder className="w-5 h-5 text-primary-500" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-charcoal truncate">{setItem.flashcard_set.title}</p>
                              <p className="text-sm text-charcoal-light">{setItem.flashcard_set.card_count} terms</p>
                            </div>
                            {selectedQuizSet === setItem.set_id && (
                              <Check className="w-5 h-5 text-primary-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-cream-50 rounded-xl">
                        <p className="text-charcoal-light">No study sets in this group yet</p>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Prompt */}
                {quizSourceType === 'ai' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-charcoal mb-2">Quiz Topic</label>
                    <textarea
                      value={quizPrompt}
                      onChange={(e) => setQuizPrompt(e.target.value)}
                      placeholder='e.g., "Java inheritance and polymorphism", "AP CSA Unit 5"'
                      className="w-full h-24 px-4 py-3 border border-cream-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}

                {/* Units/Topics (optional) */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-charcoal mb-2">Specific Units (Optional)</label>
                  <input
                    type="text"
                    value={quizUnits}
                    onChange={(e) => setQuizUnits(e.target.value)}
                    placeholder="e.g., Unit 5, Unit 6, Arrays, Inheritance"
                    className="w-full px-4 py-2.5 border border-cream-200 rounded-xl bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Question Count & Timer Row */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Questions</label>
                    <select
                      value={quizQuestionCount}
                      onChange={(e) => setQuizQuestionCount(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-cream-200 rounded-xl bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value={5}>5 questions</option>
                      <option value={10}>10 questions</option>
                      <option value={15}>15 questions</option>
                      <option value={20}>20 questions</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Time per Question</label>
                    <select
                      value={quizTimePerQuestion}
                      onChange={(e) => setQuizTimePerQuestion(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-cream-200 rounded-xl bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value={10}>10 seconds</option>
                      <option value={15}>15 seconds</option>
                      <option value={20}>20 seconds</option>
                      <option value={30}>30 seconds</option>
                      <option value={45}>45 seconds</option>
                      <option value={60}>60 seconds</option>
                    </select>
                  </div>
                </div>

                {/* Question Types */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-charcoal mb-2">Question Types</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (quizQuestionTypes.includes('mcq')) {
                          if (quizQuestionTypes.length > 1) {
                            setQuizQuestionTypes(quizQuestionTypes.filter(t => t !== 'mcq'));
                          }
                        } else {
                          setQuizQuestionTypes([...quizQuestionTypes, 'mcq']);
                        }
                      }}
                      className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                        quizQuestionTypes.includes('mcq')
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                          : 'bg-cream-100 text-charcoal-light border-2 border-cream-200'
                      }`}
                    >
                      Multiple Choice
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (quizQuestionTypes.includes('frq')) {
                          if (quizQuestionTypes.length > 1) {
                            setQuizQuestionTypes(quizQuestionTypes.filter(t => t !== 'frq'));
                          }
                        } else {
                          setQuizQuestionTypes([...quizQuestionTypes, 'frq']);
                        }
                      }}
                      className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                        quizQuestionTypes.includes('frq')
                          ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                          : 'bg-cream-100 text-charcoal-light border-2 border-cream-200'
                      }`}
                    >
                      Coding (FRQ)
                    </button>
                  </div>
                  <p className="text-xs text-charcoal-light mt-1">
                    {quizQuestionTypes.length === 2 ? 'Mixed mode: both MCQ and FRQ questions' :
                     quizQuestionTypes.includes('frq') ? 'FRQ only: Coding questions with code editor' :
                     'MCQ only: Multiple choice questions'}
                  </p>
                </div>

                {/* Points & Speed Bonus Row */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Points per Question</label>
                    <select
                      value={quizPointsPerQuestion}
                      onChange={(e) => setQuizPointsPerQuestion(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-cream-200 rounded-xl bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value={50}>50 points</option>
                      <option value={100}>100 points</option>
                      <option value={200}>200 points</option>
                      <option value={500}>500 points</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Speed Bonus</label>
                    <button
                      type="button"
                      onClick={() => setQuizSpeedBonus(!quizSpeedBonus)}
                      className={`w-full px-4 py-2.5 rounded-xl font-medium transition-colors ${
                        quizSpeedBonus
                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                          : 'bg-cream-100 text-charcoal-light border-2 border-cream-200'
                      }`}
                    >
                      {quizSpeedBonus ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateQuizModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-cream-300 rounded-xl font-medium text-charcoal hover:bg-cream-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateQuiz}
                    disabled={
                      isCreatingQuiz ||
                      (quizSourceType === 'flashcards' && !selectedQuizSet) ||
                      (quizSourceType === 'ai' && !quizPrompt.trim())
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingQuiz ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Create & Start
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Click outside to close more menu */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowMoreMenu(false)}
        />
      )}
    </>
  );
}
