'use client';
import { useRouter } from 'next/navigation';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Dashboard from '@/components/dashboard/Dashboard';
import { Button } from '@/components/ui/button';
import AppShell from '@/components/layout/AppShell';

export type RfpProject = {
  id: string;
  original_filename: string | null;
  status: string | null;
  uploaded_at: string | null;
  completed_at: string | null;
  // user_id: string | null; // Ensure this is part of your type if used in fetchProjects
};

const ADMIN_EMAIL = 'rajwaniakram@gmail.com';

export default function DashboardPage() {
  const { user, loading } = useSupabaseUser();
  const router = useRouter();
  const [projects, setProjects] = useState<RfpProject[]>([]);
  const [fetching, setFetching] = useState(true); // Start with fetching true
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchProjects() {
      if (!user) return; // Don't fetch if user is not available yet
      setFetching(true);
      setError(null);
      try {
        let query = supabase
          .from('rfp_projects')
          .select('id, original_filename, status, uploaded_at, completed_at, user_id') // Ensure user_id is selected if needed for filtering
          .order('uploaded_at', { ascending: false });

        if (user.email !== ADMIN_EMAIL) {
          query = query.eq('user_id', user.id);
        }

        const { data, error: queryError } = await query;
        if (queryError) {
          console.error("Error fetching projects:", queryError);
          setError('Failed to fetch projects: ' + queryError.message);
          setProjects([]); // Clear projects on error
        } else if (data) {
          setProjects(data as RfpProject[]);
        }
      } catch (e: any) {
        console.error("Exception fetching projects:", e);
        setError('An unexpected error occurred while fetching projects.');
        setProjects([]);
      } finally {
        setFetching(false);
      }
    }
    // Only fetch projects if user is loaded and present
    if (!loading && user) {
      fetchProjects();
    }
  }, [user, loading]); // Depend on user and loading

  const handleLogout = async () => { // Made async for consistency, though signOut isn't awaited by default
    await supabase.auth.signOut();
    router.push('/auth/login'); // Changed to router.push
  };

  if (loading) { // Simplified initial loading state
    return <div className="flex justify-center items-center min-h-screen">Loading session...</div>;
  }
  
  if (!user) {
    // This case should ideally be handled by the redirect in useEffect,
    // but as a fallback or if redirect hasn't happened yet:
    return <div className="flex justify-center items-center min-h-screen">Redirecting to login...</div>;
  }

  // User is authenticated, show the dashboard content
  return (
    <AppShell>
      {/* Logout button could also be in AppShell's Header if preferred */}
      {/* <div className="flex justify-end p-4">
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </div> */}
      {fetching ? (
        <div className="flex justify-center items-center min-h-[40vh]">Loading projects...</div>
      ) : error ? (
        <div className="text-red-500 p-4">Error: {error}</div>
      ) : (
        <Dashboard projects={projects} error={null} /> // Pass null for error if projects are successfully fetched
      )}
    </AppShell>
  );
}