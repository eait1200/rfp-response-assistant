-- Add sample trust scores to rfp_questions for testing
-- This script should only be run in development environments

-- First, check if the trust_score column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'rfp_questions'
    AND column_name = 'trust_score'
  ) THEN
    -- Update each question with a random trust score between 50 and 95
    -- Use a deterministic pattern for testing:
    -- - 25% of questions get null (no score)
    -- - 25% get 70-79 (medium score)
    -- - 25% get 80-89 (good score)
    -- - 25% get 90-95 (excellent score)
    
    -- First, set all to NULL
    UPDATE rfp_questions SET trust_score = NULL;
    
    -- Set medium scores (70-79) for questions where id % 4 = 0
    UPDATE rfp_questions 
    SET trust_score = 70 + (EXTRACT(EPOCH FROM created_at)::INTEGER % 10)
    WHERE id::text::uuid % 4 = 0;
    
    -- Set good scores (80-89) for questions where id % 4 = 1
    UPDATE rfp_questions 
    SET trust_score = 80 + (EXTRACT(EPOCH FROM created_at)::INTEGER % 10)
    WHERE id::text::uuid % 4 = 1;
    
    -- Set excellent scores (90-95) for questions where id % 4 = 2
    UPDATE rfp_questions 
    SET trust_score = 90 + (EXTRACT(EPOCH FROM created_at)::INTEGER % 6)
    WHERE id::text::uuid % 4 = 2;
    
    -- Leave questions where id % 4 = 3 as NULL
    
    RAISE NOTICE 'Sample trust scores have been added to rfp_questions table.';
  ELSE
    RAISE EXCEPTION 'trust_score column does not exist in rfp_questions table. Run the add_trust_score_to_rfp_questions.sql migration first.';
  END IF;
END
$$; 