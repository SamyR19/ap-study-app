'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Loader2, Users, X, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseKey);
};

interface GroupInfo {
  id: string;
  name: string;
  description: string | null;
  creator_id: string;
  member_count: number;
}

type AuthStep = 'initial' | 'email' | 'username' | 'password' | 'joining';

const apClasses = [
  { id: 'ap-csa', name: 'AP Computer Science A', icon: '💻' },
];

const gradeOptions = [
  '9th Grade (Freshman)',
  '10th Grade (Sophomore)',
  '11th Grade (Junior)',
  '12th Grade (Senior)',
];

export default function JoinGroupPage() {
  const params = useParams();
  const router = useRouter();
  const inviteCode = params.inviteCode as string;

  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [step, setStep] = useState<AuthStep>('initial');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<'classes' | 'grade' | 'complete'>('classes');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedGrade, setSelectedGrade] = useState('');

  useEffect(() => {
    checkInviteAndUser();
  }, [inviteCode]);

  const checkInviteAndUser = async () => {
    try {
      const supabase = getSupabase();

      // Get group info by invite code
      const { data: groupData } = await supabase.rpc('get_group_by_invite', {
        p_invite_code: inviteCode
      });

      if (!groupData || groupData.length === 0) {
        setError('This invite link is invalid or has expired.');
        setIsLoading(false);
        return;
      }

      setGroupInfo(groupData[0]);

      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setIsLoggedIn(true);

        // Check if already a member
        const { data: existingMember } = await supabase
          .from('study_group_members')
          .select('id')
          .eq('group_id', groupData[0].id)
          .eq('user_id', user.id)
          .single();

        if (existingMember) {
          // Already a member, redirect to group
          router.push(`/study-groups/${groupData[0].id}`);
          return;
        }
      }
    } catch (err) {
      console.error('Error checking invite:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    setIsJoining(true);

    try {
      const supabase = getSupabase();
      const { data: groupId, error: joinError } = await supabase.rpc('join_group_by_invite', {
        p_invite_code: inviteCode
      });

      if (joinError) throw joinError;

      router.push(`/study-groups/${groupId}`);
    } catch (err) {
      console.error('Error joining group:', err);
      setError('Failed to join group. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleEmailContinue = async () => {
    if (!email || !email.includes('@')) {
      setAuthError('Please enter a valid email');
      return;
    }
    setAuthError('');
    setIsAuthLoading(true);

    try {
      const supabase = getSupabase();

      // Check if email already exists
      const { data: emailExists } = await supabase.rpc('check_email_exists', {
        email_to_check: email.toLowerCase()
      });

      if (emailExists) {
        // User exists, they should log in
        setAuthError('This email is already registered. Please log in.');
        setIsAuthLoading(false);
        return;
      }

      setStep('username');
    } catch {
      setStep('username');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleUsernameContinue = async () => {
    if (!username || username.length < 3) {
      setAuthError('Username must be at least 3 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setAuthError('Username can only contain letters, numbers, and underscores');
      return;
    }
    setAuthError('');
    setIsAuthLoading(true);

    try {
      const supabase = getSupabase();

      const { data: usernameExists } = await supabase.rpc('check_username_exists', {
        username_to_check: username.toLowerCase()
      });

      if (usernameExists) {
        setAuthError('This username is already taken. Please choose another.');
        setIsAuthLoading(false);
        return;
      }

      setStep('password');
    } catch {
      setStep('password');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!password || password.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }
    setAuthError('');
    setIsAuthLoading(true);

    try {
      const supabase = getSupabase();

      const { error: signUpError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: {
            username: username.toLowerCase(),
            full_name: '',
          },
        },
      });

      if (signUpError) {
        setAuthError(signUpError.message);
        return;
      }

      // Show onboarding
      setShowAuthModal(false);
      setShowOnboarding(true);
    } catch (err) {
      console.error('Signup error:', err);
      setAuthError('Failed to create account. Please try again.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleOnboardingNext = async () => {
    if (onboardingStep === 'classes') {
      setOnboardingStep('grade');
    } else if (onboardingStep === 'grade') {
      setIsAuthLoading(true);

      try {
        const supabase = getSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Update profile with onboarding data
          await supabase.from('profiles').update({
            grade_level: selectedGrade,
          }).eq('id', user.id);

          // Save selected AP classes
          for (const classId of selectedClasses) {
            const className = apClasses.find(c => c.id === classId)?.name || classId;
            await supabase.from('user_ap_classes').insert({
              user_id: user.id,
              class_id: classId,
              class_name: className,
            });
          }
        }
      } catch (err) {
        console.error('Onboarding save error:', err);
      }

      setOnboardingStep('complete');
      setStep('joining');

      // Join the group
      setTimeout(async () => {
        await handleJoinGroup();
      }, 1500);
    }
  };

  const handleClassToggle = (classId: string) => {
    setSelectedClasses(prev =>
      prev.includes(classId)
        ? prev.filter(c => c !== classId)
        : [...prev, classId]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-light" />
      </div>
    );
  }

  if (error && !groupInfo) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-charcoal mb-2">Invalid Invite</h1>
          <p className="text-charcoal-light mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Onboarding flow after signup
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Image
              src="/aceai-logo.svg"
              alt="AceAI"
              width={48}
              height={48}
              className="rounded-xl"
            />
          </div>

          <AnimatePresence mode="wait">
            {onboardingStep === 'classes' && (
              <motion.div
                key="classes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h2 className="text-2xl font-bold text-charcoal mb-2">
                  Which AP classes are you taking?
                </h2>
                <p className="text-charcoal-light mb-6">Select all that apply.</p>

                <div className="space-y-2 mb-6">
                  {apClasses.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => handleClassToggle(cls.id)}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                        selectedClasses.includes(cls.id)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-cream-300 hover:border-charcoal-light/40'
                      }`}
                    >
                      <span className="text-xl">{cls.icon}</span>
                      <span className="flex-1 font-medium text-charcoal">{cls.name}</span>
                      {selectedClasses.includes(cls.id) && (
                        <Check className="w-5 h-5 text-primary-500" />
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleOnboardingNext}
                  disabled={selectedClasses.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-charcoal text-white rounded-xl hover:bg-charcoal/90 transition-colors font-medium disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {onboardingStep === 'grade' && (
              <motion.div
                key="grade"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h2 className="text-2xl font-bold text-charcoal mb-2">
                  What grade are you in?
                </h2>
                <p className="text-charcoal-light mb-6">
                  This helps us personalize your experience.
                </p>

                <div className="space-y-2 mb-6">
                  {gradeOptions.map((grade) => (
                    <button
                      key={grade}
                      onClick={() => setSelectedGrade(grade)}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                        selectedGrade === grade
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-cream-300 hover:border-charcoal-light/40'
                      }`}
                    >
                      <span className="flex-1 font-medium text-charcoal">{grade}</span>
                      {selectedGrade === grade && (
                        <Check className="w-5 h-5 text-primary-500" />
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleOnboardingNext}
                  disabled={!selectedGrade || isAuthLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-charcoal text-white rounded-xl hover:bg-charcoal/90 transition-colors font-medium disabled:opacity-50"
                >
                  {isAuthLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Join Group
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {onboardingStep === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-charcoal mb-2">Joining {groupInfo?.name}...</h2>
                <p className="text-charcoal-light">Taking you to your study group</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          {/* Group Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary-500" />
            </div>

            <h1 className="text-2xl font-bold text-charcoal mb-2">
              Join {groupInfo?.name}
            </h1>
            <p className="text-charcoal-light mb-6">
              {groupInfo?.member_count} {groupInfo?.member_count === 1 ? 'member' : 'members'} already studying together
            </p>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            {isLoggedIn ? (
              <button
                onClick={handleJoinGroup}
                disabled={isJoining}
                className="w-full px-6 py-3.5 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full px-6 py-3.5 bg-charcoal text-white rounded-xl font-medium hover:bg-charcoal/90 transition-colors"
              >
                Sign up to join
              </button>
            )}
          </div>

          {!isLoggedIn && (
            <p className="text-charcoal-light text-sm">
              Already have an account?{' '}
              <a href="/login" className="text-primary-500 hover:text-primary-600 font-medium">
                Log in
              </a>
            </p>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-100 transition-colors"
              >
                <X className="w-5 h-5 text-charcoal-light" />
              </button>

              <div className="p-8">
                <div className="mb-6">
                  <Image
                    src="/aceai-logo.svg"
                    alt="AceAI"
                    width={48}
                    height={48}
                    className="rounded-xl"
                  />
                </div>

                <AnimatePresence mode="wait">
                  {step === 'initial' || step === 'email' ? (
                    <motion.div
                      key="email"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <h2 className="text-2xl font-bold text-charcoal mb-2">
                        Create account to join
                      </h2>
                      <p className="text-charcoal-light mb-6">
                        Join {groupInfo?.name} and start studying together
                      </p>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-charcoal mb-2">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleEmailContinue()}
                          placeholder="you@example.com"
                          autoFocus
                          className="w-full px-4 py-3 border-2 border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      {authError && <p className="text-red-500 text-sm mb-4">{authError}</p>}

                      <button
                        onClick={handleEmailContinue}
                        disabled={isAuthLoading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-charcoal text-white rounded-xl hover:bg-charcoal/90 transition-colors font-medium disabled:opacity-50"
                      >
                        {isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
                      </button>
                    </motion.div>
                  ) : step === 'username' ? (
                    <motion.div
                      key="username"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <h2 className="text-2xl font-bold text-charcoal mb-2">Choose a username</h2>
                      <p className="text-charcoal-light mb-6">for {email}</p>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-charcoal mb-2">Username</label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase())}
                          onKeyDown={(e) => e.key === 'Enter' && handleUsernameContinue()}
                          placeholder="your_username"
                          autoFocus
                          className="w-full px-4 py-3 border-2 border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      {authError && <p className="text-red-500 text-sm mb-4">{authError}</p>}

                      <button
                        onClick={handleUsernameContinue}
                        disabled={isAuthLoading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-charcoal text-white rounded-xl hover:bg-charcoal/90 transition-colors font-medium disabled:opacity-50"
                      >
                        {isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
                      </button>

                      <button
                        onClick={() => setStep('email')}
                        className="mt-4 w-full text-center text-sm text-charcoal-light hover:text-charcoal"
                      >
                        Back
                      </button>
                    </motion.div>
                  ) : step === 'password' ? (
                    <motion.div
                      key="password"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <h2 className="text-2xl font-bold text-charcoal mb-2">Create a password</h2>
                      <p className="text-charcoal-light mb-6">for @{username}</p>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-charcoal mb-2">Password</label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleCreateAccount()}
                          placeholder="Min. 6 characters"
                          autoFocus
                          className="w-full px-4 py-3 border-2 border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      {authError && <p className="text-red-500 text-sm mb-4">{authError}</p>}

                      <button
                        onClick={handleCreateAccount}
                        disabled={isAuthLoading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-charcoal text-white rounded-xl hover:bg-charcoal/90 transition-colors font-medium disabled:opacity-50"
                      >
                        {isAuthLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          'Create account'
                        )}
                      </button>

                      <button
                        onClick={() => setStep('username')}
                        className="mt-4 w-full text-center text-sm text-charcoal-light hover:text-charcoal"
                      >
                        Back
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
