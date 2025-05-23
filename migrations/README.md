# Database Migrations

This directory contains SQL migrations for the Supabase database.

## Applying Migrations

Migrations can be applied using the Supabase dashboard or CLI. 

### Using Supabase Dashboard

1. Navigate to your project's SQL Editor in the Supabase dashboard
2. Copy the contents of the migration file
3. Paste into the SQL editor and run the query

### Using Supabase CLI

If you have the Supabase CLI installed, you can run:

```bash
supabase db push --sql-file ./migrations/your_migration_file.sql
```

## Available Migrations

- `add_trust_score_to_rfp_questions.sql`: Adds a trust_score column to the rfp_questions table to store confidence scores (0-100) for AI-generated content.
- `add_sample_trust_scores.sql`: (Development only) Adds sample trust scores to existing questions for testing the accuracy score feature.

## Migration Order

1. Run `add_trust_score_to_rfp_questions.sql` first to add the column and constraints
2. (Optional, development only) Run `add_sample_trust_scores.sql` to populate sample data

## After Migration

The code in `app/rfps/all/page.tsx` is already set up to use the trust_score data to calculate and display average accuracy scores on the RFP cards. 