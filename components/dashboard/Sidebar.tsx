'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { signOut } from '@/lib/supabase';
import {
  Home,
  Users,
  GraduationCap,
  Folder,
  MessageSquare,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
}

const mainNavItems: NavItem[] = [
  { id: 'home', label: 'Home', href: '/dashboard', icon: Home },
  { id: 'course', label: 'AP CSA Course', href: '/course', icon: GraduationCap },
  { id: 'study-groups', label: 'Study Groups', href: '/study-groups', icon: Users },
  { id: 'library', label: 'Your library', href: '/library', icon: Folder },
  { id: 'ai-chat', label: 'AI Chat', href: '/ai-chat', icon: MessageSquare },
];


interface SidebarProps {
  user?: {
    name?: string;
    email?: string;
    avatar_url?: string;
  } | null;
  onCollapseChange?: (isCollapsed: boolean) => void;
}

export function Sidebar({ user, onCollapseChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleCollapseChange = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    onCollapseChange?.(collapsed);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isItemActive = item.href ? isActive(item.href) : item.children?.some(child => isActive(child.href));

    return (
      <div key={item.id}>
        {item.href && !hasChildren ? (
          <Link
            href={item.href}
            className={cn(
              'flex items-center h-12 px-4 rounded-xl transition-colors',
              isItemActive
                ? 'bg-accent text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
          </Link>
        ) : (
          <>
            <button
              onClick={() => !isCollapsed && toggleExpanded(item.id)}
              className={cn(
                'flex items-center h-12 px-4 rounded-xl transition-colors w-full',
                isItemActive
                  ? 'bg-accent text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="ml-3 flex-1 text-left whitespace-nowrap">{item.label}</span>
                  {hasChildren && (
                    isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </>
              )}
            </button>

            {hasChildren && isExpanded && !isCollapsed && (
              <div className="ml-8 mt-1 space-y-1">
                {item.children!.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      'flex items-center h-10 px-4 rounded-xl transition-colors text-sm',
                      isActive(child.href)
                        ? 'bg-accent text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    )}
                  >
                    <span>{child.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <motion.aside
      onMouseEnter={() => handleCollapseChange(false)}
      onMouseLeave={() => { handleCollapseChange(true); setExpandedItems([]); }}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed left-0 top-0 h-screen flex flex-col bg-card border-r border-border z-40 overflow-hidden"
    >
      {/* Profile Section */}
      <div className="p-4">
        <div className="flex items-center h-14">
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={user?.avatar_url || ''} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="ml-3 min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Student</p>
              <p className="text-base font-semibold text-foreground truncate">
                {user?.name || 'Samy Rabah'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Separator */}
      <div className="mx-4 h-[1px] bg-border" />

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
        <div className={cn(
          'mb-3 h-4',
          isCollapsed ? 'flex justify-center -mx-4' : ''
        )}>
          <p className={cn(
            'text-xs font-medium text-muted-foreground uppercase',
            isCollapsed ? 'tracking-normal' : 'px-4 tracking-wider'
          )}>
            Main
          </p>
        </div>
        <nav className="space-y-1">
          {mainNavItems.map((item) => renderNavItem(item))}
        </nav>

      </div>

      {/* Bottom Section */}
      <div className="mx-4 h-[1px] bg-border" />
      <div className="p-4 space-y-1">
        <Link
          href="/help"
          className={cn(
            'flex items-center h-12 px-4 rounded-xl transition-colors',
            isActive('/help')
              ? 'bg-accent text-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          )}
        >
          <HelpCircle className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="ml-3 whitespace-nowrap">Help</span>}
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center h-12 px-4 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="ml-3 whitespace-nowrap">Logout Account</span>}
        </button>
      </div>
    </motion.aside>
  );
}
