'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { SettingsDropdown } from '@/components/dashboard/SettingsDropdown';
import { CreateMenuPopup } from '@/components/create/CreateMenuPopup';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Loader2, Search, Flame, Sparkles, Settings, Plus } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [createMenuPosition, setCreateMenuPosition] = useState<{ top: number; left: number } | undefined>(undefined);
  const createButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Check for existing session - use getUser() to validate with server
    const checkSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (!user || error) {
          router.push('/login');
          return;
        }

        setUser(user);

        // Fetch streak
        const { data: streakData } = await supabase
          .from('user_streaks')
          .select('current_streak')
          .eq('user_id', user.id)
          .single();

        if (streakData) {
          setStreak(streakData.current_streak);
        }

        setLoading(false);
      } catch {
        router.push('/login');
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/login');
        } else if (session) {
          setUser(session.user);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userData = {
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatar_url: user.user_metadata?.avatar_url || '',
  };

  const handleOpenCreateMenu = () => {
    if (createButtonRef.current) {
      const rect = createButtonRef.current.getBoundingClientRect();
      setCreateMenuPosition({
        top: rect.bottom + 8,
        left: Math.max(16, rect.left - 140), // Center the menu under the button
      });
    }
    setIsCreateMenuOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar user={userData} onCollapseChange={setIsSidebarCollapsed} />

      {/* Top Header Bar */}
      <header
        className="fixed top-0 right-0 h-16 bg-background border-b border-border z-30 flex items-center justify-between px-6 transition-all duration-200"
        style={{ left: isSidebarCollapsed ? 80 : 256 }}
      >
        {/* Search Bar - Left aligned */}
        <div className="w-full max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for anything..."
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground text-foreground"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Create Button */}
          <button
            ref={createButtonRef}
            onClick={handleOpenCreateMenu}
            className="w-9 h-9 flex items-center justify-center bg-foreground text-background rounded-full hover:opacity-90 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Upgrade Button - Filled */}
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors text-sm">
            <Sparkles className="w-4 h-4" />
            Upgrade: free 7-day trial
          </button>

          {/* Streak */}
          <div className="flex items-center gap-1.5">
            <Flame className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">{streak}</span>
          </div>

          {/* Settings Icon with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
            <SettingsDropdown
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
              user={userData}
            />
          </div>
        </div>
      </header>

      {/* Main Content - with top padding for header */}
      <main
        className="pt-16 min-h-screen transition-all duration-200"
        style={{ marginLeft: isSidebarCollapsed ? 80 : 256 }}
      >
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Create Menu Popup */}
      <CreateMenuPopup
        isOpen={isCreateMenuOpen}
        onClose={() => setIsCreateMenuOpen(false)}
        anchorPosition={createMenuPosition}
        onCreateFolder={() => {
          // TODO: Implement folder creation modal
          console.log('Create folder');
        }}
      />
    </div>
  );
}
