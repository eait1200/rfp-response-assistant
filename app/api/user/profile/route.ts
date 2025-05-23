import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET endpoint to fetch the user's profile or a specific user's profile (if admin)
export async function GET(request: Request) {
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

  // Authenticate the user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Get query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || user.id;

    // If trying to access another user's profile, check if admin
    if (userId !== user.id && user.app_metadata?.app_role !== 'admin') {
      return NextResponse.json({ error: 'Access denied: You can only view your own profile' }, { status: 403 });
    }

    // Call the RPC function to get the profile
    const { data, error } = await supabase.rpc('get_user_profile', { user_id_param: userId });

    if (error) {
      console.error("Error fetching user profile:", error);
      return NextResponse.json({ error: `Failed to fetch profile: ${error.message}` }, { status: 500 });
    }

    // The RPC function returns an array with one item or empty array
    const profile = data?.[0] || null;
    
    return NextResponse.json({ 
      profile,
      isOwnProfile: userId === user.id
    });
  } catch (err: any) {
    console.error("Unexpected error in profile fetch:", err);
    return NextResponse.json({ error: `Unexpected error: ${err.message}` }, { status: 500 });
  }
}

// PATCH endpoint to update the user's profile
export async function PATCH(request: Request) {
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

  // Authenticate the user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Parse request body
    const { userId, firstName, lastName } = await request.json();
    
    // Validate if the userId is provided and exists
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // If trying to update another user's profile, check if admin
    if (userId !== user.id && user.app_metadata?.app_role !== 'admin') {
      return NextResponse.json({ error: 'Access denied: You can only update your own profile' }, { status: 403 });
    }

    // Call the RPC function to update the profile
    const { data, error } = await supabase.rpc('update_user_profile', { 
      user_id_param: userId,
      first_name_param: firstName,
      last_name_param: lastName
    });

    if (error) {
      console.error("Error updating user profile:", error);
      return NextResponse.json({ error: `Failed to update profile: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profile: data
    });
  } catch (err: any) {
    console.error("Unexpected error in profile update:", err);
    return NextResponse.json({ error: `Unexpected error: ${err.message}` }, { status: 500 });
  }
} 