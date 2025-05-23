-- Add sample attachments checklist to each RFP project that doesn't have one

DO $$
DECLARE
  project_record RECORD;
BEGIN
  -- Loop through each project
  FOR project_record IN SELECT id FROM rfp_projects
  LOOP
    -- Check if this project already has an attachments checklist
    IF NOT EXISTS (
      SELECT 1 
      FROM rfp_questions
      WHERE project_id = project_record.id
      AND (
        identified_question_text ILIKE '%attachments checklist%'
        OR identified_question_text ILIKE '%provide the following files%'
      )
    ) THEN
      -- Insert a new attachments checklist question
      INSERT INTO rfp_questions (
        project_id,
        identified_question_text,
        section_header,
        ai_generated_answer,
        status,
        editor_info,
        reviewer_info
      ) VALUES (
        project_record.id,
        'Attachments checklist',
        'By responding to this RFI, please provide the following files:',
        'Everstream can furnish a variety of supporting documents as requested in an RFI. Typically, specific files such as personnel CVs or solution roadmaps are provided as separate attachments tailored to your requirements to ensure relevance. Furthermore, Everstream maintains key industry certifications, like SOC 2 Type 2, and evidence of such certifications can also be supplied. This an edit.kjklkjhlkhk',
        'Draft',
        NULL,
        NULL
      );
      
      RAISE NOTICE 'Added attachments checklist to project ID: %', project_record.id;
    END IF;
  END LOOP;
END
$$; 