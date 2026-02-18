'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Trophy,
  Moon,
  LogOut,
  Shield,
  HelpCircle,
  Zap,
  Trash2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

interface SettingsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    name?: string;
    email?: string;
    avatar_url?: string;
  } | null;
}

export function SettingsDropdown({ isOpen, onClose, user }: SettingsDropdownProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Call the delete_my_account RPC function (defined in Supabase SQL)
      // This will delete all user data and the auth user record
      const { error } = await supabase.rpc('delete_my_account');

      if (error) {
        console.error('Delete account RPC error:', error);
        // Fallback: manually delete data if RPC not set up yet
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          await supabase.from('user_progress').delete().eq('user_id', currentUser.id);
          await supabase.from('profiles').delete().eq('id', currentUser.id);
        }
      }

      // Sign out the user
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Delete account error:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-cream-200 overflow-hidden z-50"
          >
            {/* User Info */}
            <div className="p-4 border-b border-cream-200">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user?.avatar_url || ''} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-600 font-medium text-lg">
                    {user?.name?.charAt(0).toUpperCase() || 'S'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-charcoal truncate">
                    {user?.name || 'Student'}
                  </p>
                  <p className="text-sm text-charcoal-light truncate">
                    {user?.email || 'student@example.com'}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-charcoal-light hover:bg-cream-50 hover:text-charcoal transition-colors">
                <Trophy className="w-5 h-5" />
                <span>Streaks and achievements</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-charcoal-light hover:bg-cream-50 hover:text-charcoal transition-colors">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-charcoal-light hover:bg-cream-50 hover:text-charcoal transition-colors">
                <Moon className="w-5 h-5" />
                <span>Dark mode</span>
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-cream-200 mx-2" />

            {/* Secondary Menu Items */}
            <div className="p-2">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-charcoal hover:bg-cream-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Log out</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-charcoal-light hover:bg-cream-50 hover:text-charcoal transition-colors">
                <Shield className="w-5 h-5" />
                <span>Privacy policy</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-charcoal-light hover:bg-cream-50 hover:text-charcoal transition-colors">
                <HelpCircle className="w-5 h-5" />
                <span>Help and feedback</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-charcoal-light hover:bg-cream-50 hover:text-charcoal transition-colors">
                <Zap className="w-5 h-5" />
                <span>Upgrade</span>
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-cream-200 mx-2" />

            {/* Delete Account */}
            <div className="p-2">
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete account</span>
                </button>
              ) : (
                <div className="p-3 bg-red-50 rounded-xl">
                  <p className="text-sm text-red-600 mb-3">
                    Are you sure? This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-charcoal bg-white border border-cream-300 rounded-lg hover:bg-cream-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
