import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Ensure these environment variables are defined, otherwise throw an error or handle appropriately
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anon Key for client-side client. Check .env file.");
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey); 