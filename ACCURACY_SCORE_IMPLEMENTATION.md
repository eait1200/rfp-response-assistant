# Implementing the Accuracy Score Feature

This document provides step-by-step instructions for implementing the accuracy score feature for RFP projects.

## Overview

The accuracy score feature displays a visual indicator of the average trust score for all questions in an RFP project. This helps users quickly assess the overall confidence level of AI-generated responses.

## Current Status

✅ The accuracy score feature has been fully implemented:
- The UI displays a circular indicator showing the average trust score
- The `trust_score` column has been added to the database
- Sample data has been populated for testing
- The code has been updated to calculate and display actual accuracy scores

## Implementation Details

### 1. Database Changes ✅

The following changes were made to the database:

```sql
-- Add trust_score column to rfp_questions table
ALTER TABLE rfp_questions ADD COLUMN trust_score INTEGER;
    
-- Add a constraint to ensure the score is between 0 and 100
ALTER TABLE rfp_questions ADD CONSTRAINT trust_score_range CHECK (trust_score IS NULL OR (trust_score >= 0 AND trust_score <= 100));
    
-- Add comment to the column
COMMENT ON COLUMN rfp_questions.trust_score IS 'The trust score (0-100) indicating confidence in the AI-generated content';
    
-- Add index to improve query performance when filtering by trust_score
CREATE INDEX idx_rfp_questions_trust_score ON rfp_questions(trust_score);
```

### 2. Sample Data ✅

Sample trust scores were added to the database for testing using the following pattern:
- 25% of questions: NULL (no score)
- 25% of questions: 70-79 (medium confidence)
- 25% of questions: 80-89 (good confidence)
- 25% of questions: 90-95 (excellent confidence)

### 3. Code Updates ✅

The `fetchProjects` function in `app/rfps/all/page.tsx` was updated to:
- Include `trust_score` in the database query
- Calculate the average trust score for each project
- Display the score in the circular indicator

## Next Steps

### Integration with the N8N Workflow

In your N8N workflow that processes RFP uploads, you'll need to add logic to:

1. Calculate trust scores for each question (between 0-100)
2. Include these scores in the JSON payload sent to Supabase
3. Ensure the `trust_score` value is stored in the `rfp_questions` table for each question

### Suggested N8N Implementation

1. After processing each RFP question response:
   - Analyze the confidence level of the AI-generated content
   - Assign a score between 0-100 (higher = more confident)
   - Add this score to the question object as `trust_score`

2. When sending data to Supabase:
   - Ensure the `trust_score` field is included in each question object

Example payload structure:
```json
{
  "question": "What is your approach to risk management?",
  "response": "Our approach includes...",
  "status": "Draft",
  "trust_score": 85
}
```

## Troubleshooting

If you encounter issues:

1. **Missing scores**: Check that your N8N workflow is correctly calculating and sending trust scores
2. **Constraint violation**: Ensure all trust scores are within the 0-100 range
3. **Calculation errors**: Verify that the averaging logic in `fetchProjects` is working correctly 