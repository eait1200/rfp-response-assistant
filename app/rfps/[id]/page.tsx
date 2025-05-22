// app/rfps/[id]/page.tsx
'use client'; // Added for client-side hooks

import AppShell from '@/components/layout/AppShell';
import RfpWorkspace from '@/components/workspace/RfpWorkspace'; // Assuming this is your main component for this page
import { useSupabaseUser } from '@/lib/useSupabaseUser'; // Added
import { useRouter } from 'next/navigation'; // Added
import { useEffect } from 'react'; // Added

interface RfpPageProps { // Renamed Props to RfpPageProps for clarity
  params: { id: string };
}

// The generateStaticParams function has been REMOVED from here.

export const dynamic = 'force-dynamic';

export default function RfpPage({ params }: RfpPageProps) {
  const { user, loading } = useSupabaseUser(); // Corrected isLoading to loading
  const router = useRouter(); // Added

  useEffect(() => { // Added
    if (!loading && !user) { // Corrected isLoading to loading
      router.push('/auth/login');
    }
  }, [user, loading, router]); // Corrected isLoading to loading

  if (loading) { // Corrected isLoading to loading
    return <div>Loading...</div>; // Or a more sophisticated loading spinner
  }

  if (!user) { // Added
    return null; // Or redirect, though useEffect handles it
  }

  return (
    <AppShell> {/* Ensure AppShell provides your consistent layout (sidebar, header) */}
      {/* The RfpWorkspace component will receive the id and will be responsible
          for fetching and displaying data for that specific RFP ID.
          It currently contains all the UI elements Bolt.new generated for the
          RFP Workspace (Project Context Header, Tabs, Q&A list etc.)
      */}
      <RfpWorkspace rfpId={params.id} /> {/* Pass the id as a prop, renamed for clarity */}
    </AppShell>
  );
}