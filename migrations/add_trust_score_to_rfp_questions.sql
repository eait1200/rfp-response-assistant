-- Add trust_score column to rfp_questions table

-- Check if the column already exists
DO $$
BEGIN
  -- Add the trust_score column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'rfp_questions'
    AND column_name = 'trust_score'
  ) THEN
    -- Trust score is an integer between 0 and 100
    ALTER TABLE rfp_questions ADD COLUMN trust_score INTEGER;
    
    -- Add a constraint to ensure the score is between 0 and 100
    ALTER TABLE rfp_questions ADD CONSTRAINT trust_score_range CHECK (trust_score IS NULL OR (trust_score >= 0 AND trust_score <= 100));
    
    -- Add comment to the column
    COMMENT ON COLUMN rfp_questions.trust_score IS 'The trust score (0-100) indicating confidence in the AI-generated content';
    
    -- Add index to improve query performance when filtering by trust_score
    CREATE INDEX idx_rfp_questions_trust_score ON rfp_questions(trust_score);
  END IF;
END
$$; 