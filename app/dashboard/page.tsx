'use client';
import AppShell from '@/components/layout/AppShell';
import { Construction } from 'lucide-react'; // Using an appropriate icon
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading } = useSupabaseUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">Loading session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <AppShell activeRoute="dashboard (coming soon)"> 
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gradient-to-br from-everstream-blue/5 to-everstream-orange/5">
        <Construction className="w-24 h-24 text-everstream-orange mb-8" />
        <h1 className="text-4xl font-bold text-everstream-blue mb-4 font-raleway">
          Dashboard Coming Soon!
        </h1>
        <p className="text-lg text-gray-700 max-w-md">
          We&apos;re working hard to bring you an insightful dashboard experience. Please check back later.
        </p>
      </div>
    </AppShell>
  );
}