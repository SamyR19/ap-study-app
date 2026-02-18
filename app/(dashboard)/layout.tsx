'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real app, you'd fetch the user from Supabase here
  const mockUser = {
    name: 'Samy Rabah',
    email: 'student@example.com',
    avatar_url: '',
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <Sidebar user={mockUser} />

      {/* Main Content - solid color background */}
      <main className="ml-64 min-h-screen transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
