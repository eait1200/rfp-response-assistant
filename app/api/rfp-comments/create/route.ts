import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

// Ensure your environment variables are correctly set up
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase URL or Service Role Key');
  throw new Error('Missing Supabase environment variables for comment creation.');
}

// This admin client is for operations requiring service_role bypass, if any.
// For user-specific actions, use the client derived from cookies.
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey); // Assuming createClient is from '@supabase/supabase-js' for admin

interface CommentRequestBody {
  questionId: string;
  commentText: string;
  // userDisplayName will now be derived from the authenticated user
}

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error fetching user or no user authenticated:', userError);
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { questionId, commentText }: CommentRequestBody = await req.json();

    if (!questionId || !commentText) {
      return NextResponse.json({ error: 'Missing required fields: questionId or commentText' }, { status: 400 });
    }

    // Use user's email or a profile display name if available
    // For simplicity, using email. You might have a profiles table to get a display name.
    const userDisplayNameFromAuth = user.email || 'Authenticated User';
    
    // Consider if you have a separate profiles table to get a more friendly display name or initials
    // For now, deriving initials from email before '@' or the display name.
    let initials = 'AU';
    if (userDisplayNameFromAuth) {
        const namePart = userDisplayNameFromAuth.includes('@') ? userDisplayNameFromAuth.split('@')[0] : userDisplayNameFromAuth;
        initials = namePart.substring(0, 2).toUpperCase(); // Simple initials logic
    }

    const newComment = {
      id: uuidv4(),
      question_id: questionId,
      comment_text: commentText,
      user_id: user.id, // Use the authenticated user's ID
      user_display_name: userDisplayNameFromAuth,
      // user_avatar_initials: initials, // Add this if you have the column and want to store it
      created_at: new Date().toISOString(),
    };
    
    // Insert using the supabaseAdmin client if you need to bypass RLS for inserts,
    // otherwise, you could use the user-specific `supabase` client if RLS is set up for inserts.
    // For simplicity and direct control, using supabaseAdmin for the insert here.
    const { data: commentData, error: insertError } = await supabaseAdmin
      .from('rfp_comments')
      .insert(newComment)
      .select()
      .single();

    if (insertError) {
      console.error('Supabase error inserting comment:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    if (!commentData) {
      return NextResponse.json({ error: 'Failed to create comment, no data returned.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, comment: commentData }, { status: 201 });

  } catch (err: any) {
    console.error('Error in /api/rfp-comments/create:', err);
    return NextResponse.json({ error: err.message || 'Unknown error occurred' }, { status: 500 });
  }
} 