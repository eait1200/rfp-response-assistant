import AppShell from '@/components/layout/AppShell';
import Dashboard from '@/components/dashboard/Dashboard';
import { supabase } from '@/lib/supabaseClient';
import type { Tables } from '@/types/supabase';

export type RfpProject = Pick<
  Tables<'rfp_projects'>,
  'id' | 'original_filename' | 'status' | 'uploaded_at' | 'completed_at'
>;

export default async function DashboardPage() {
  let projects: RfpProject[] = [];
  let error: string | null = null;

  try {
    const { data, error: fetchError } = await supabase
      .from('rfp_projects')
      .select('id, original_filename, status, uploaded_at, completed_at')
      .order('uploaded_at', { ascending: false });
    if (fetchError) {
      error = 'Failed to fetch projects.';
      console.error(fetchError);
    } else if (data) {
      projects = data as RfpProject[];
    }
  } catch (err) {
    error = 'An unexpected error occurred.';
    console.error(err);
  }

  return (
    <AppShell activeRoute="dashboard">
      <Dashboard projects={projects} error={error} />
    </AppShell>
  );
}