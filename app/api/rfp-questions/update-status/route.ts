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
    const { questionId, newStatus } = await req.json();
    if (!questionId || typeof newStatus !== 'string') {
      return NextResponse.json({ error: 'Missing questionId or newStatus' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('rfp_questions')
      .update({
        status: newStatus,
        last_status_change_at: new Date().toISOString(),
      })
      .eq('id', questionId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Question not found or no update occurred' }, { status: 404 });
    }

    return NextResponse.json({ success: true, question: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
} 