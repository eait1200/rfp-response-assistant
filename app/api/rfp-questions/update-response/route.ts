import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(req: NextRequest) {
  try {
    const { questionId, editedAnswer } = await req.json();
    console.log('[API] update-response: Received', { questionId, editedAnswer });
    if (!questionId || typeof editedAnswer !== 'string') {
      console.error('[API] update-response: Missing questionId or editedAnswer');
      return NextResponse.json({ error: 'Missing questionId or editedAnswer' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('rfp_questions')
      .update({
        edited_answer: editedAnswer,
        last_edited_at: new Date().toISOString(),
      })
      .eq('id', questionId)
      .select()
      .single();

    console.log('[API] update-response: Supabase update result', { data, error });

    if (error) {
      console.error('[API] update-response: Supabase error', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      console.error('[API] update-response: No data returned (question not found or no update occurred)');
      return NextResponse.json({ error: 'Question not found or no update occurred' }, { status: 404 });
    }

    console.log('[API] update-response: Success', data);
    return NextResponse.json({ success: true, question: data });
  } catch (err: any) {
    console.error('[API] update-response: Exception', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
} 