import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Define Supabase URL and Anon Key directly or get from process.env
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing from environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
    // You might want to throw an error here in production or provide default values for development
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
