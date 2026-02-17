import { Sidebar } from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real app, you'd fetch the user from Supabase here
  const mockUser = {
    name: 'Student',
    email: 'student@example.com',
    avatar_url: '',
  };

  return (
    <div className="min-h-screen bg-white">
      <Sidebar user={mockUser} />

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen">
        {/* Mobile top padding for header */}
        <div className="md:hidden h-16" />

        {/* Content */}
        <div className="max-w-[1200px] mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
