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
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 401 });
  }

  if (callingUser.app_metadata?.app_role !== 'admin') {
    return NextResponse.json({ error: 'Access Denied: You must be an admin.' }, { status: 403 });
  }

  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
  }

  if (userId === callingUser.id) {
    return NextResponse.json({ error: 'Admins cannot delete themselves.' }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } } // Important for service client
  );

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (deleteError) {
    console.error('Error deleting user:', deleteError);
    return NextResponse.json({ error: `Failed to delete user: ${deleteError.message}` }, { status: 500 });
  }

  return NextResponse.json({ message: 'User deleted successfully.' });
} 