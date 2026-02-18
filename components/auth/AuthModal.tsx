'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ArrowRight, Check } from 'lucide-react';
import { signInWithGoogle } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';

type AuthStep = 'initial' | 'email' | 'username' | 'password' | 'verify' | 'onboarding';
type OnboardingQuestion = 'classes' | 'grade' | 'school' | 'complete';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const apClasses = [
  { id: 'ap-csa', name: 'AP Computer Science A', icon: '💻' },
  { id: 'ap-csp', name: 'AP Computer Science Principles', icon: '🖥️', comingSoon: true },
  { id: 'ap-calc-ab', name: 'AP Calculus AB', icon: '📐', comingSoon: true },
  { id: 'ap-calc-bc', name: 'AP Calculus BC', icon: '📊', comingSoon: true },
  { id: 'ap-physics-1', name: 'AP Physics 1', icon: '⚛️', comingSoon: true },
  { id: 'ap-bio', name: 'AP Biology', icon: '🧬', comingSoon: true },
];

const gradeOptions = [
  '9th Grade (Freshman)',
  '10th Grade (Sophomore)',
  '11th Grade (Junior)',
  '12th Grade (Senior)',
];

// Initialize Supabase client
const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseKey);
};

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [step, setStep] = useState<AuthStep>('initial');
  const [onboardingStep, setOnboardingStep] = useState<OnboardingQuestion>('classes');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [school, setSchool] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch {
      setError('Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailContinue = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const supabase = getSupabase();

      // Check if email already exists
      const { data: emailExists } = await supabase.rpc('check_email_exists', {
        email_to_check: email.toLowerCase()
      });

      if (emailExists) {
        setError('This email is already registered. Please log in instead.');
        setIsLoading(false);
        return;
      }

      setStep('username');
    } catch (err) {
      console.error('Email check error:', err);
      // If RPC doesn't exist yet, continue anyway
      setStep('username');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameContinue = async () => {
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const supabase = getSupabase();

      // Check if username already exists
      const { data: usernameExists } = await supabase.rpc('check_username_exists', {
        username_to_check: username.toLowerCase()
      });

      if (usernameExists) {
        setError('This username is already taken. Please choose another.');
        setIsLoading(false);
        return;
      }

      setStep('password');
    } catch (err) {
      console.error('Username check error:', err);
      // If RPC doesn't exist yet, continue anyway
      setStep('password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const supabase = getSupabase();

      // Sign up with username in metadata
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
        if (signUpError.message.includes('already registered')) {
          setError('This email is already registered. Please log in instead.');
        } else {
          setError(signUpError.message);
        }
        return;
      }

      setStep('verify');
    } catch (err) {
      console.error('Signup error:', err);
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = () => {
    // For now, skip verification and go to onboarding
    // In production, you'd verify the code with Supabase
    setError('');
    setStep('onboarding');
    setOnboardingStep('classes');
  };

  const handleClassToggle = (classId: string) => {
    setSelectedClasses(prev =>
      prev.includes(classId)
        ? prev.filter(c => c !== classId)
        : [...prev, classId]
    );
  };

  const handleOnboardingNext = async () => {
    if (onboardingStep === 'classes') {
      setOnboardingStep('grade');
    } else if (onboardingStep === 'grade') {
      setOnboardingStep('school');
    } else if (onboardingStep === 'school') {
      setIsLoading(true);

      try {
        const supabase = getSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Update profile with onboarding data
          await supabase.from('profiles').update({
            grade_level: selectedGrade,
            school: school,
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
      } finally {
        setIsLoading(false);
      }

      setOnboardingStep('complete');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    }
  };

  const resetModal = () => {
    setStep('initial');
    setOnboardingStep('classes');
    setEmail('');
    setUsername('');
    setPassword('');
    setVerifyCode('');
    setSelectedClasses([]);
    setSelectedGrade('');
    setSchool('');
    setError('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const isFullScreen = step !== 'initial';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50"
          />

          {/* Modal Container */}
          <AnimatePresence mode="wait">
            {!isFullScreen ? (
              /* Small Modal - Initial State */
              <motion.div
                key="small-modal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
              >
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-100 transition-colors z-10"
                >
                  <X className="w-5 h-5 text-charcoal-light" />
                </button>

                <div className="p-8">
                  {/* Logo */}
                  <div className="mb-6">
                    <Image
                      src="/aceai-logo.svg"
                      alt="AceAI"
                      width={48}
                      height={48}
                      className="rounded-xl"
                    />
                  </div>

                  <h2 className="text-2xl font-bold text-charcoal">Start Learning.</h2>
                  <p className="text-xl text-charcoal-light mb-6">Create free account</p>

                  {/* Google Button */}
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="relative w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-cream-300 rounded-xl hover:bg-cream-50 hover:border-cream-400 transition-all mb-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-medium text-charcoal">Continue with Google</span>
                    <span className="absolute right-3 px-2 py-0.5 bg-primary-100 text-primary-600 rounded text-xs font-medium">Last used</span>
                  </button>

                  {/* GitHub Button */}
                  <button
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-cream-300 rounded-xl hover:bg-cream-50 hover:border-cream-400 transition-all mb-4"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <span className="font-medium text-charcoal">Continue with GitHub</span>
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-4 my-4">
                    <div className="flex-1 h-px bg-cream-300" />
                    <span className="text-sm text-charcoal-light">OR</span>
                    <div className="flex-1 h-px bg-cream-300" />
                  </div>

                  {/* Email Button */}
                  <button
                    onClick={() => setStep('email')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-charcoal text-white rounded-xl hover:bg-charcoal/90 transition-colors font-medium"
                  >
                    Continue with email
                  </button>

                  {/* Terms */}
                  <p className="mt-4 text-sm text-charcoal-light">
                    By continuing, you agree to the{' '}
                    <a href="#" className="underline hover:text-charcoal">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="underline hover:text-charcoal">Privacy Policy</a>.
                  </p>
                </div>
              </motion.div>
            ) : (
              /* Full Screen Modal - After clicking Continue with email */
              <motion.div
                key="full-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full flex bg-white"
              >
                {/* Left Side - Form */}
                <div className="w-1/2 h-full flex items-center justify-center p-12 overflow-y-auto">
                  <div className="w-full max-w-md">
                    {/* Logo */}
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
                      {/* Email Step */}
                      {step === 'email' && (
                        <motion.div
                          key="email-step"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <h2 className="text-2xl font-bold text-charcoal mb-8">Create your account</h2>

                          {/* Google Button */}
                          <button
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="relative w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-cream-300 rounded-xl hover:bg-cream-50 hover:border-cream-400 transition-all mb-3"
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span className="font-medium text-charcoal">Continue with Google</span>
                            <span className="absolute right-3 px-2 py-0.5 bg-primary-100 text-primary-600 rounded text-xs font-medium">Last used</span>
                          </button>

                          {/* GitHub Button */}
                          <button
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-cream-300 rounded-xl hover:bg-cream-50 hover:border-cream-400 transition-all mb-4"
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                            </svg>
                            <span className="font-medium text-charcoal">Continue with GitHub</span>
                          </button>

                          {/* Divider */}
                          <div className="flex items-center gap-4 my-4">
                            <div className="flex-1 h-px bg-cream-300" />
                            <span className="text-sm text-charcoal-light">OR</span>
                            <div className="flex-1 h-px bg-cream-300" />
                          </div>

                          {/* Email Input */}
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

                          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                          {/* Terms */}
                          <p className="text-sm text-charcoal-light mb-4">
                            By continuing, you agree to the{' '}
                            <a href="#" className="underline hover:text-charcoal">Terms of Service</a>
                            {' '}and{' '}
                            <a href="#" className="underline hover:text-charcoal">Privacy Policy</a>.
                          </p>

                          {/* Continue Button */}
                          <button
                            onClick={handleEmailContinue}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-charcoal text-white rounded-xl hover:bg-charcoal/90 transition-colors font-medium disabled:opacity-50"
                          >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
                          </button>

                          {/* Login Link */}
                          <p className="mt-4 text-center text-sm text-charcoal-light">
                            Already have an account?{' '}
                            <a href="/login" className="underline font-medium text-charcoal hover:text-primary-500">Log in</a>
                          </p>
                        </motion.div>
                      )}

                      {/* Username Step */}
                      {step === 'username' && (
                        <motion.div
                          key="username-step"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <h2 className="text-2xl font-bold text-charcoal mb-2">Choose a username</h2>
                          <p className="text-charcoal-light mb-6">for {email}</p>

                          {/* Username Input */}
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
                            <p className="text-xs text-charcoal-light mt-1">Letters, numbers, and underscores only</p>
                          </div>

                          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                          {/* Continue Button */}
                          <button
                            onClick={handleUsernameContinue}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-charcoal text-white rounded-xl hover:bg-charcoal/90 transition-colors font-medium disabled:opacity-50"
                          >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
                          </button>

                          {/* Back Link */}
                          <button
                            onClick={() => setStep('email')}
                            className="mt-4 w-full text-center text-sm text-charcoal-light hover:text-charcoal"
                          >
                            Back
                          </button>
                        </motion.div>
                      )}

                      {/* Password Step */}
                      {step === 'password' && (
                        <motion.div
                          key="password-step"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <h2 className="text-2xl font-bold text-charcoal mb-2">Create a password</h2>
                          <p className="text-charcoal-light mb-6">for @{username}</p>

                          {/* Password Input */}
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

                          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                          {/* Create Account Button */}
                          <button
                            onClick={handleCreateAccount}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-charcoal text-white rounded-xl hover:bg-charcoal/90 transition-colors font-medium disabled:opacity-50"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating account...
                              </>
                            ) : (
                              'Create account'
                            )}
                          </button>

                          {/* Back Link */}
                          <button
                            onClick={() => setStep('username')}
                            className="mt-4 w-full text-center text-sm text-charcoal-light hover:text-charcoal"
                          >
                            Back
                          </button>
                        </motion.div>
                      )}

                      {/* Verify Step */}
                      {step === 'verify' && (
                        <motion.div
                          key="verify-step"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <h2 className="text-2xl font-bold text-charcoal mb-2">Verify your email</h2>
                          <p className="text-charcoal-light mb-6">
                            We sent a code to {email}
                          </p>

                          {/* Code Input */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-charcoal mb-2">Verification code</label>
                            <input
                              type="text"
                              value={verifyCode}
                              onChange={(e) => setVerifyCode(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
                              placeholder="Enter 6-digit code"
                              autoFocus
                              maxLength={6}
                              className="w-full px-4 py-3 border-2 border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-widest"
                            />
                          </div>

                          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                          {/* Verify Button */}
                          <button
                            onClick={handleVerifyCode}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-charcoal text-white rounded-xl hover:bg-charcoal/90 transition-colors font-medium"
                          >
                            Verify
                          </button>

                          <p className="mt-4 text-center text-sm text-charcoal-light">
                            Didn&apos;t receive the code?{' '}
                            <button className="underline font-medium text-charcoal hover:text-primary-500">
                              Resend
                            </button>
                          </p>
                        </motion.div>
                      )}

                      {/* Onboarding Questions */}
                      {step === 'onboarding' && (
                        <motion.div
                          key="onboarding-step"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <AnimatePresence mode="wait">
                            {/* Classes Question */}
                            {onboardingStep === 'classes' && (
                              <motion.div
                                key="classes-q"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                              >
                                <h2 className="text-2xl font-bold text-charcoal mb-2">
                                  Which AP classes are you taking?
                                </h2>
                                <p className="text-charcoal-light mb-6">
                                  Select all that apply.
                                </p>

                                <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
                                  {apClasses.map((cls) => (
                                    <button
                                      key={cls.id}
                                      onClick={() => !cls.comingSoon && handleClassToggle(cls.id)}
                                      disabled={cls.comingSoon}
                                      className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                                        cls.comingSoon
                                          ? 'opacity-50 cursor-not-allowed border-cream-200'
                                          : selectedClasses.includes(cls.id)
                                          ? 'border-primary-500 bg-primary-50'
                                          : 'border-cream-300 hover:border-charcoal-light/40'
                                      }`}
                                    >
                                      <span className="text-xl">{cls.icon}</span>
                                      <span className="flex-1 font-medium text-charcoal">{cls.name}</span>
                                      {cls.comingSoon && (
                                        <span className="text-xs text-charcoal-light">Soon</span>
                                      )}
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

                            {/* Grade Question */}
                            {onboardingStep === 'grade' && (
                              <motion.div
                                key="grade-q"
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
                                  disabled={!selectedGrade}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-charcoal text-white rounded-xl hover:bg-charcoal/90 transition-colors font-medium disabled:opacity-50"
                                >
                                  Continue
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              </motion.div>
                            )}

                            {/* School Question */}
                            {onboardingStep === 'school' && (
                              <motion.div
                                key="school-q"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                              >
                                <h2 className="text-2xl font-bold text-charcoal mb-2">
                                  What&apos;s your school?
                                </h2>
                                <p className="text-charcoal-light mb-6">
                                  Connect with classmates taking the same courses.
                                </p>

                                <div className="mb-6">
                                  <input
                                    type="text"
                                    value={school}
                                    onChange={(e) => setSchool(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && school && handleOnboardingNext()}
                                    placeholder="e.g. Lincoln High School"
                                    autoFocus
                                    className="w-full px-4 py-3 border-2 border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                  />
                                </div>

                                <button
                                  onClick={handleOnboardingNext}
                                  disabled={isLoading}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-charcoal text-white rounded-xl hover:bg-charcoal/90 transition-colors font-medium disabled:opacity-50"
                                >
                                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Finish setup'}
                                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                                </button>

                                <button
                                  onClick={() => {
                                    setSchool('');
                                    handleOnboardingNext();
                                  }}
                                  className="mt-3 w-full text-center text-sm text-charcoal-light hover:text-charcoal"
                                >
                                  Skip for now
                                </button>
                              </motion.div>
                            )}

                            {/* Complete */}
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
                                <h2 className="text-2xl font-bold text-charcoal mb-2">You&apos;re all set!</h2>
                                <p className="text-charcoal-light">Redirecting to your dashboard...</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Right Side - Curved Gradient Background */}
                <div className="w-1/2 h-full p-6 flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-cream-100 via-blue-100/80 to-pink-200/90 rounded-3xl flex items-center justify-center p-12 relative overflow-hidden">
                    {/* Close Button */}
                    <button
                      onClick={handleClose}
                      className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-colors z-10"
                    >
                      <X className="w-5 h-5 text-charcoal-light" />
                    </button>

                    {/* Chat Input Preview */}
                    <div className="w-full max-w-md">
                      <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
                        <span className="text-charcoal-light flex-1">Ask AceAI to help you study...</span>
                        <div className="w-10 h-10 bg-charcoal rounded-full flex items-center justify-center">
                          <ArrowRight className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
