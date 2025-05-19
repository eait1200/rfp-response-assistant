import { supabase } from '@/lib/supabaseClient';
import type { Tables } from '@/types/supabase';
import RfpWorkspaceClient from './RfpWorkspaceClient';

interface RfpWorkspaceProps {
  rfpId: string;
}

export default async function RfpWorkspace({ rfpId }: RfpWorkspaceProps) {
  // Fetch project details (include all new fields)
  const { data: project, error: projectError } = await supabase
    .from('rfp_projects')
    .select(`
      id,
      original_filename,
      client_name,
      due_date,
      value_range,
      display_rfp_id,
      description,
      project_lead_id,
      tags
    `)
    .eq('id', rfpId)
    .single();

  // Fetch questions for this project
  const { data: questions, error: questionsError } = await supabase
    .from('rfp_questions')
    .select('*')
    .eq('project_id', rfpId)
    .order('original_row_number', { ascending: true });

  if (projectError) {
    return <div className="p-8 text-red-600">Error loading project: {projectError.message}</div>;
  }
  if (!project) {
    return <div className="p-8 text-muted-foreground">Project not found.</div>;
  }
  if (questionsError) {
    return <div className="p-8 text-red-600">Error loading questions: {questionsError.message}</div>;
  }

  return (
    <RfpWorkspaceClient project={project} questions={questions || []} />
  );
}