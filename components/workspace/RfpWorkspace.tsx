'use client'; // Make this a client component

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Tables } from '@/types/supabase'; // Assuming RfpProject and RfpQuestion types are here or similar
import RfpWorkspaceClient from './RfpWorkspaceClient';

// Define more specific types if available, using Tables as a placeholder
interface RfpProjectData extends Tables<'rfp_projects'> {}
interface RfpQuestionData extends Tables<'rfp_questions'> {}

interface RfpWorkspaceProps {
  rfpId: string;
}

export default function RfpWorkspace({ rfpId }: RfpWorkspaceProps) {
  const [project, setProject] = useState<RfpProjectData | null>(null);
  const [questions, setQuestions] = useState<RfpQuestionData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!rfpId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch project details - selecting all fields from the Row type
        const { data: projectData, error: projectError } = await supabase
          .from('rfp_projects')
          .select(`
            id,
            client_name,
            completed_at,
            description,
            display_rfp_id,
            due_date,
            n8n_job_id,
            original_filename,
            project_lead_id,
            status,
            tags,
            uploaded_at,
            user_id,
            value_range
          `)
          .eq('id', rfpId)
          .single();

        if (projectError) throw projectError;
        setProject(projectData);

        // Fetch questions for this project
        const { data: questionsData, error: questionsError } = await supabase
          .from('rfp_questions')
          .select('*')
          .eq('project_id', rfpId)
          .order('original_row_number', { ascending: true });

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);

      } catch (e: any) {
        console.error('Error fetching RFP data:', e);
        setError(e.message || 'Failed to load RFP data.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [rfpId]);

  if (loading) {
    return <div className="p-8 text-center">Loading RFP data...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  if (!project) {
    return <div className="p-8 text-muted-foreground">Project not found.</div>;
  }

  return (
    <RfpWorkspaceClient project={project} questions={questions || []} />
  );
}