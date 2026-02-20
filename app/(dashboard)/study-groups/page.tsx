'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { Plus, Users, X, Loader2, UserPlus, Check, Copy } from 'lucide-react';

const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseKey);
};

interface StudyGroup {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  member_count: number;
  created_at: string;
}

export default function StudyGroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [joinError, setJoinError] = useState('');
  const [createdGroupCode, setCreatedGroupCode] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Get groups user is a member of
      const { data: memberData } = await supabase
        .from('study_group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (memberData && memberData.length > 0) {
        const groupIds = memberData.map(m => m.group_id);

        const { data: groupsData } = await supabase
          .from('study_groups')
          .select('*')
          .in('id', groupIds);

        if (groupsData) {
          // Get member counts for each group
          const groupsWithCounts = await Promise.all(
            groupsData.map(async (group) => {
              const { count } = await supabase
                .from('study_group_members')
                .select('*', { count: 'exact', head: true })
                .eq('group_id', group.id);

              return {
                ...group,
                member_count: count || 0
              };
            })
          );

          setGroups(groupsWithCounts);
        }
      }
    } catch (err) {
      console.error('Error loading groups:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a random 6-digit invite code
  const generateInviteCode = () => {
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Try to generate invite code via RPC, fall back to local generation
      let inviteCode: string;
      try {
        const { data } = await supabase.rpc('generate_invite_code');
        inviteCode = data || generateInviteCode();
      } catch {
        inviteCode = generateInviteCode();
      }

      // Create the group
      const { data: group, error: createError } = await supabase
        .from('study_groups')
        .insert({
          name: groupName.trim(),
          creator_id: user.id,
          invite_code: inviteCode,
        })
        .select()
        .single();

      if (createError) {
        console.error('Create group error:', createError);
        if (createError.message.includes('does not exist')) {
          setError('Study groups table not set up. Please run the SQL schema in Supabase.');
        } else {
          setError(createError.message || 'Failed to create group.');
        }
        return;
      }

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('study_group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'admin',
        });

      if (memberError) {
        console.error('Add member error:', memberError);
      }

      // Show the invite code before navigating
      setCreatedGroupCode(inviteCode);
    } catch (err) {
      console.error('Error creating group:', err);
      const message = err instanceof Error ? err.message : 'Failed to create group.';
      if (message.includes('does not exist') || message.includes('relation')) {
        setError('Database not set up. Please run the study groups SQL schema in Supabase SQL Editor.');
      } else {
        setError(message);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim() || joinCode.length !== 6) {
      setJoinError('Please enter a valid 6-digit code');
      return;
    }

    setIsJoining(true);
    setJoinError('');

    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Find group by invite code
      const { data: group, error: groupError } = await supabase
        .from('study_groups')
        .select('*')
        .eq('invite_code', joinCode.trim())
        .single();

      if (groupError || !group) {
        setJoinError('Invalid invite code. Please check and try again.');
        return;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('study_group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        setJoinError('You are already a member of this group');
        return;
      }

      // Join the group
      const { error: joinError } = await supabase
        .from('study_group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'member',
        });

      if (joinError) {
        setJoinError('Failed to join group. Please try again.');
        return;
      }

      // Navigate to the group
      router.push(`/study-groups/${group.id}`);
    } catch (err) {
      console.error('Error joining group:', err);
      setJoinError('Something went wrong. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-light" />
      </div>
    );
  }

  // Empty state - no groups
  if (groups.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 -mt-16">
          <div className="bg-cream-50 rounded-3xl p-12 w-full max-w-3xl">
            <div className="flex flex-col items-center text-center">
              {/* Illustration */}
              <div className="relative mb-8">
                <div className="w-48 h-36 bg-white rounded-2xl shadow-sm flex items-center justify-center relative">
                  <div className="w-24 h-3 bg-cream-200 rounded-full mb-2" />
                  <div className="w-16 h-3 bg-cream-200 rounded-full absolute bottom-12" />

                  {/* Running person illustration placeholder */}
                  <div className="absolute -right-4 -top-4 w-20 h-24 bg-gradient-to-br from-primary-200 to-primary-300 rounded-xl flex items-center justify-center">
                    <Users className="w-10 h-10 text-primary-600" />
                  </div>
                </div>

                {/* Connected avatars */}
                <div className="flex items-center justify-center mt-4 -space-x-1">
                  <div className="w-10 h-10 rounded-full bg-pink-200 border-2 border-white flex items-center justify-center text-sm">
                    A
                  </div>
                  <div className="w-8 h-1 bg-primary-400" />
                  <div className="w-10 h-10 rounded-full bg-yellow-200 border-2 border-white flex items-center justify-center text-sm">
                    B
                  </div>
                  <div className="w-8 h-1 bg-primary-400" />
                  <div className="w-10 h-10 rounded-full bg-green-200 border-2 border-white flex items-center justify-center text-sm">
                    C
                  </div>
                  <div className="w-8 h-1 bg-primary-400" />
                  <div className="w-10 h-10 rounded-full bg-blue-200 border-2 border-white flex items-center justify-center text-sm">
                    D
                  </div>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-charcoal mb-2">
                Get your study group on AceAI
              </h1>
              <p className="text-xl text-charcoal mb-8">
                and study flashcards together
              </p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-6 py-3.5 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create a group
                </button>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="flex items-center gap-2 px-6 py-3.5 border-2 border-charcoal text-charcoal rounded-xl font-medium hover:bg-cream-100 transition-colors"
                >
                  <UserPlus className="w-5 h-5" />
                  Join a group
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Create Group Modal */}
        <CreateGroupModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setGroupName('');
            setError('');
            setCreatedGroupCode(null);
          }}
          groupName={groupName}
          setGroupName={setGroupName}
          onCreate={handleCreateGroup}
          isCreating={isCreating}
          error={error}
          createdCode={createdGroupCode}
          onGoToGroup={() => {
            loadGroups().then(() => {
              setShowCreateModal(false);
              loadGroups();
            });
          }}
        />

        {/* Join Group Modal */}
        <JoinGroupModal
          isOpen={showJoinModal}
          onClose={() => {
            setShowJoinModal(false);
            setJoinCode('');
            setJoinError('');
          }}
          joinCode={joinCode}
          setJoinCode={setJoinCode}
          onJoin={handleJoinGroup}
          isJoining={isJoining}
          error={joinError}
        />
      </>
    );
  }

  // Groups list view
  return (
    <>
      <div className="px-2">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-charcoal">Study Groups</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 border-2 border-charcoal text-charcoal rounded-xl font-medium hover:bg-cream-100 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Join group
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create group
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {groups.map((group) => (
            <motion.button
              key={group.id}
              onClick={() => router.push(`/study-groups/${group.id}`)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full p-5 bg-cream-50 rounded-2xl text-left hover:bg-cream-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-charcoal">{group.name}</h3>
                  <p className="text-sm text-charcoal-light mt-1">
                    {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
                  </p>
                </div>
                <div className="flex -space-x-2">
                  {Array.from({ length: Math.min(group.member_count, 4) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center text-xs font-medium text-primary-600"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                  {group.member_count > 4 && (
                    <div className="w-8 h-8 rounded-full bg-cream-200 border-2 border-white flex items-center justify-center text-xs font-medium text-charcoal-light">
                      +{group.member_count - 4}
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setGroupName('');
          setError('');
          setCreatedGroupCode(null);
        }}
        groupName={groupName}
        setGroupName={setGroupName}
        onCreate={handleCreateGroup}
        isCreating={isCreating}
        error={error}
        createdCode={createdGroupCode}
        onGoToGroup={() => {
          // Find the group we just created and navigate to it
          loadGroups().then(() => {
            const newGroup = groups.find(g => g.invite_code === createdGroupCode);
            if (newGroup) {
              router.push(`/study-groups/${newGroup.id}`);
            } else {
              setShowCreateModal(false);
              loadGroups();
            }
          });
        }}
      />

      {/* Join Group Modal */}
      <JoinGroupModal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setJoinCode('');
          setJoinError('');
        }}
        joinCode={joinCode}
        setJoinCode={setJoinCode}
        onJoin={handleJoinGroup}
        isJoining={isJoining}
        error={joinError}
      />
    </>
  );
}

// Create Group Modal Component
function CreateGroupModal({
  isOpen,
  onClose,
  groupName,
  setGroupName,
  onCreate,
  isCreating,
  error,
  createdCode,
  onGoToGroup,
}: {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  setGroupName: (name: string) => void;
  onCreate: () => void;
  isCreating: boolean;
  error: string;
  createdCode?: string | null;
  onGoToGroup?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (createdCode) {
      navigator.clipboard.writeText(createdCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-100 transition-colors"
            >
              <X className="w-5 h-5 text-charcoal-light" />
            </button>

            <div className="p-8">
              {createdCode ? (
                // Show invite code after creation
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-charcoal mb-2 text-center">Group Created!</h2>
                  <p className="text-charcoal-light mb-6 text-center">
                    Share this code with friends to invite them to your study group
                  </p>

                  {/* Invite Code Display */}
                  <div className="bg-cream-50 rounded-xl p-6 mb-6">
                    <p className="text-sm text-charcoal-light mb-2 text-center">Invite Code</p>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-4xl font-mono font-bold tracking-[0.3em] text-charcoal">
                        {createdCode}
                      </span>
                      <button
                        onClick={copyCode}
                        className="p-2 hover:bg-cream-200 rounded-lg transition-colors"
                        title="Copy code"
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <Copy className="w-5 h-5 text-charcoal-light" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 px-6 py-3 border-2 border-cream-300 text-charcoal rounded-xl font-medium hover:bg-cream-100 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={onGoToGroup}
                      className="flex-1 px-6 py-3 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors"
                    >
                      Go to Group
                    </button>
                  </div>
                </>
              ) : (
                // Show create form
                <>
                  <h2 className="text-2xl font-bold text-charcoal mb-2">Create a study group</h2>
                  <p className="text-charcoal-light mb-6">
                    Study your flashcards together as a group and track each other&apos;s progress
                  </p>

                  {/* Group Name Input */}
                  <div className="mb-6">
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !isCreating && groupName.trim() && onCreate()}
                      placeholder="Enter a name for your group"
                      autoFocus
                      className="w-full px-4 py-3.5 border-2 border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-charcoal placeholder:text-charcoal-light/60"
                    />
                  </div>

                  {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                  {/* Create Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={onCreate}
                      disabled={isCreating || !groupName.trim()}
                      className="px-6 py-3 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create group'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Join Group Modal Component
function JoinGroupModal({
  isOpen,
  onClose,
  joinCode,
  setJoinCode,
  onJoin,
  isJoining,
  error,
}: {
  isOpen: boolean;
  onClose: () => void;
  joinCode: string;
  setJoinCode: (code: string) => void;
  onJoin: () => void;
  isJoining: boolean;
  error: string;
}) {
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setJoinCode(value);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-100 transition-colors"
            >
              <X className="w-5 h-5 text-charcoal-light" />
            </button>

            <div className="p-8">
              <h2 className="text-2xl font-bold text-charcoal mb-2">Join a study group</h2>
              <p className="text-charcoal-light mb-6">
                Enter the 6-digit invite code to join an existing study group
              </p>

              {/* Code Input */}
              <div className="mb-6">
                <input
                  type="text"
                  value={joinCode}
                  onChange={handleCodeChange}
                  onKeyDown={(e) => e.key === 'Enter' && !isJoining && joinCode.length === 6 && onJoin()}
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                  className="w-full px-4 py-4 border-2 border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-charcoal text-center text-3xl font-mono tracking-[0.5em] placeholder:text-charcoal-light/40"
                />
              </div>

              {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

              {/* Join Button */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-cream-300 text-charcoal rounded-xl font-medium hover:bg-cream-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onJoin}
                  disabled={isJoining || joinCode.length !== 6}
                  className="flex-1 px-6 py-3 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    'Join Group'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
