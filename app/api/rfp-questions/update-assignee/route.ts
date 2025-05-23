import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(req: NextRequest) {
  try {
    const { questionId, field, value } = await req.json(); // value will be userId (string/UUID) or null
    
    if (!questionId || !["editor_id", "reviewer_id"].includes(field)) {
      return NextResponse.json(
        { error: 'Missing questionId or invalid field (must be editor_id or reviewer_id)' }, 
        { status: 400 }
      );
    }

    // Validate if value is a UUID or null (if removing assignee)
    if (value !== null && !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)) {
      // A simple UUID regex check. For production, you might want a more robust validation.
      if (value !== null) { // only error if value is not null and not a UUID
        return NextResponse.json(
          { error: 'Invalid assignee ID format. Must be a UUID or null.' }, 
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from('rfp_questions')
      .update({ [field]: value })
      .eq('id', questionId)
      .select();

    if (error) {
      console.error('Supabase error updating assignee:', error);
      return NextResponse.json(
        { error: `Failed to update assignee: ${error.message}` }, 
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Question not found or no changes made' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Assignee updated successfully', updatedQuestion: data[0] });

  } catch (error: any) {
    console.error('API error updating assignee:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` }, 
      { status: 500 }
    );
  }
} 