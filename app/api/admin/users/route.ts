import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
// We might not need createClient from '@supabase/supabase-js' here anymore if RPC handles all admin actions
// import { createClient } from '@supabase/supabase-js'; 

export async function GET() {
  try {
    const cookieStore = cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          // set and remove are not strictly needed for GET if only reading cookies
          // but are good practice if the client might perform auth actions
          // that need to be persisted back to the browser.
          // set(name: string, value: string, options: CookieOptions) {
          //   cookieStore.set({ name, value, ...options });
          // },
          // remove(name: string, options: CookieOptions) {
          //   cookieStore.delete({ name, ...options });
          // },
        },
      }
    );
    
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Auth error in /api/admin/users (SSR):', userError);
      return NextResponse.json({ error: 'Unauthorized - Authentication failed' }, { status: 401 });
    }
    
    // Check if user is admin
    const userRole = user.app_metadata?.app_role;
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    
    // Use the RPC function to get users
    const { data: users, error: rpcError } = await supabase.rpc('get_users_admin');
    
    if (rpcError) {
      console.error('Database error calling get_users_admin RPC (SSR):', rpcError);
      return NextResponse.json({ error: 'Database error finding users: ' + rpcError.message }, { status: 500 });
    }
    
    // The RPC function returns an array of users directly.
    return NextResponse.json({ users });

  } catch (error: any) {
    console.error('API route error in /api/admin/users (SSR):', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
} 