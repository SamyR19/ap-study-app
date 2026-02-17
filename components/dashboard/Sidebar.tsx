'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from '@/lib/supabase';
import {
  Home,
  Code,
  TrendingUp,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Practice', href: '/practice', icon: Code },
  { label: 'Progress', href: '/progress', icon: TrendingUp },
  { label: 'Subjects', href: '/subjects', icon: BookOpen },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  user?: {
    name?: string;
    email?: string;
    avatar_url?: string;
  } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <Image src="/aceai-logo.svg" alt="AceAI" width={40} height={40} />
        <span className="text-xl font-bold text-charcoal">AceAI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-secondary-200 text-primary-500 border-l-4 border-primary-500 pl-2'
                  : 'text-charcoal-light hover:bg-cream-200 hover:text-charcoal'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="pt-4 border-t border-cream-300">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.avatar_url || ''} />
            <AvatarFallback className="bg-primary-100 text-primary-600">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-charcoal truncate">
              {user?.name || 'Student'}
            </p>
            <p className="text-xs text-charcoal-light truncate">
              {user?.email || 'student@example.com'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-charcoal-light hover:text-charcoal hover:bg-cream-200"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col bg-cream-100 border-r border-cream-300 p-6 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-cream-300 flex items-center justify-between px-4 z-50">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-charcoal hover:bg-cream-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="text-lg font-bold text-charcoal">AceAI</span>
        <Avatar className="w-8 h-8">
          <AvatarImage src={user?.avatar_url || ''} />
          <AvatarFallback className="bg-primary-100 text-primary-600 text-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`md:hidden fixed left-0 top-0 h-screen w-64 flex-col bg-cream-100 p-6 z-50 transform transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-2 text-charcoal hover:bg-cream-200 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex flex-col h-full">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}
