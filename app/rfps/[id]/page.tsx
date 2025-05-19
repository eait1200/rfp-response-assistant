// app/rfps/[id]/page.tsx
import AppShell from '@/components/layout/AppShell';
import RfpWorkspace from '@/components/workspace/RfpWorkspace'; // Assuming this is your main component for this page

interface RfpPageProps { // Renamed Props to RfpPageProps for clarity
  params: { id: string };
}

// The generateStaticParams function has been REMOVED from here.

export default function RfpPage({ params }: RfpPageProps) {
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