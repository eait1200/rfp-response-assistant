'use client';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import type { User as AuthUser } from '@supabase/supabase-js';

// Define a more comprehensive User type that includes profile information
export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email?: string; // Email might come from auth user
  app_role?: string; // Role might come from auth user metadata
}

export interface AppUser extends AuthUser {
  profile?: UserProfile | null; // Profile data from your 'profiles' table
}

export function useSupabaseUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchUserAndProfile(authUser: AuthUser): Promise<AppUser | null> {
      if (!authUser) return null;
      
      // Fetch profile data
      try {
        const { data: profileData, error: profileError } = await supabase
          .rpc('get_user_profile', { user_id_param: authUser.id });

        if (profileError) {
          console.error("Error fetching user profile in hook:", profileError);
          // Return auth user even if profile fetch fails, profile will be null
          return { ...authUser, profile: null }; 
        }
        
        const userProfile = profileData?.[0] || null;
        return { ...authUser, profile: userProfile };

      } catch (e: any) {
        console.error("Exception fetching profile in hook:", e);
        return { ...authUser, profile: null }; 
      }
    }

    async function getInitialSession() {
      if (!isMounted) return;
      setLoading(true);
      try {
        const { data: { user: initialAuthUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error("Error getting initial auth user:", authError.message);
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (initialAuthUser && isMounted) {
          const fullUser = await fetchUserAndProfile(initialAuthUser);
          if (isMounted) {
            setUser(fullUser);
          }
        } else if (isMounted) {
          setUser(null);
        }
      } catch (e: any) {
        console.error("Exception in getInitialSession:", e.message);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      setLoading(true);

      const authUser = session?.user || null;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (authUser) {
          const fullUser = await fetchUserAndProfile(authUser);
          if (isMounted) setUser(fullUser);
        } else if (isMounted) {
          setUser(null); // Should not happen if session is valid
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) setUser(null);
      } else if (event === 'INITIAL_SESSION' && authUser) { // Handle initial session event
        const fullUser = await fetchUserAndProfile(authUser);
        if (isMounted) setUser(fullUser);
      } else if (event === 'INITIAL_SESSION' && !authUser) {
        if(isMounted) setUser(null);
      }

      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return { user, loading };
} 