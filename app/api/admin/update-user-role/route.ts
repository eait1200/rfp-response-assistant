import { createServerClient } from '@supabase/ssr';
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
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  const { data: { user: callingUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !callingUser) {
    console.error("Authentication error in update-user-role:", authError);
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 401 });
  }

  if (callingUser.app_metadata?.app_role !== 'admin') {
    console.error("Non-admin user attempted role update:", callingUser.id);
    return NextResponse.json({ error: 'Access Denied: You must be an admin.' }, { status: 403 });
  }

  const { userId, newRole } = await request.json();

  console.log("Updating user role:", { userId, newRole });

  if (!userId || !newRole) {
    console.error("Missing required fields for role update:", { userId, newRole });
    return NextResponse.json({ error: 'User ID and new role are required.' }, { status: 400 });
  }

  if (!['admin', 'member'].includes(newRole)) {
    console.error("Invalid role specified:", newRole);
    return NextResponse.json({ error: 'Invalid role specified. Must be "admin" or "member".' }, { status: 400 });
  }

  if (userId === callingUser.id && newRole !== 'admin') {
    console.error("Admin attempted to demote themselves:", callingUser.id);
    return NextResponse.json({ error: 'Admins cannot demote themselves.' }, { status: 400 });
  }

  // Create a new RPC function to update the user role
  try {
    // First, execute an RPC function to safely update the user's role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // Create the RPC function if it doesn't exist yet
    await supabaseAdmin.rpc('create_update_user_role_function_if_not_exists');

    // Execute the RPC function to update the user's role
    const { data, error } = await supabaseAdmin.rpc('admin_update_user_role', {
      user_id_param: userId,
      new_role_param: newRole
    });

    if (error) {
      console.error("Error from admin_update_user_role RPC:", error);
      return NextResponse.json({ error: `Failed to update user role: ${error.message}` }, { status: 500 });
    }

    console.log("User role updated successfully:", data);

    // Return success even without verifying
    return NextResponse.json({ 
      message: 'User role updated successfully.',
      updated: data
    });
  } catch (err: any) {
    console.error("Unexpected error in role update:", err);
    return NextResponse.json({ error: `Unexpected error: ${err.message}` }, { status: 500 });
  }
} 