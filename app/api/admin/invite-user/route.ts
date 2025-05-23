import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  // Use getUser() instead of getSession() for server-side authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication failed or user not found.' }, { status: 401 });
  }

  if (user.app_metadata.app_role !== 'admin') {
    return NextResponse.json({ error: 'Access Denied: You must be an admin to perform this action.' }, { status: 403 });
  }

  const { email: invitedUserEmail, role: roleToAssign } = await request.json();

  if (!invitedUserEmail) {
    return NextResponse.json({ error: 'Email is required to invite a user.' }, { status: 400 });
  }
  if (!roleToAssign || (roleToAssign !== 'admin' && roleToAssign !== 'member')) {
    return NextResponse.json({ error: 'Valid role (admin/member) is required to invite a user.' }, { status: 400 });
  }

  // Use the service role client to invite the user
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    invitedUserEmail,
    { data: { app_role: roleToAssign } } 
  );

  if (inviteError) {
    return NextResponse.json({ error: `Failed to invite user: ${inviteError.message}` }, { status: 500 });
  }

  return NextResponse.json({ message: `Invitation sent successfully to ${invitedUserEmail} with role ${roleToAssign}.` , invitedUser: data });
} 