-- Add editor_info and reviewer_info columns to rfp_questions table

-- Check if the editor_info column already exists
DO $$
BEGIN
  -- Add the editor_info column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'rfp_questions'
    AND column_name = 'editor_info'
  ) THEN
    -- Add editor_info column
    ALTER TABLE rfp_questions ADD COLUMN editor_info TEXT;
    
    -- Add comment to the column
    COMMENT ON COLUMN rfp_questions.editor_info IS 'Information about the editor assigned to this question';
  END IF;

  -- Add the reviewer_info column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'rfp_questions'
    AND column_name = 'reviewer_info'
  ) THEN
    -- Add reviewer_info column
    ALTER TABLE rfp_questions ADD COLUMN reviewer_info TEXT;
    
    -- Add comment to the column
    COMMENT ON COLUMN rfp_questions.reviewer_info IS 'Information about the reviewer assigned to this question';
  END IF;
END
$$; 