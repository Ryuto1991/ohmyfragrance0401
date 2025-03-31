import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

export function createClient(cookieStore: ReadonlyRequestCookies) {
  // Define Supabase URL and Service Role Key directly or get from process.env
  // Use Service Role Key for server-side operations that require elevated privileges
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

   if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn('Supabase URL or Service Role Key is missing from environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
    // Handle appropriately
  }

  return createServerClient(supabaseUrl, supabaseServiceRoleKey, {
    cookies: {
      // Provide cookie handling functions for the server client
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch (error) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}


// Helper function to create a server client specifically for Route Handlers or Server Actions
// This uses the service role key and doesn't rely on user cookies for authentication state
// Useful for operations like the /api/fragrances route we created
export function createRouteHandlerClient() {
    const cookieStore = cookies(); // This is a Promise
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        console.warn('Supabase URL or Service Role Key missing for Route Handler Client.');
        // Handle appropriately
    }

    return createServerClient(supabaseUrl, supabaseServiceRoleKey, {
        cookies: {
            async getAll() {
                // Await the cookieStore promise before calling getAll
                const store = await cookieStore;
                return store.getAll();
            },
            async setAll(cookiesToSet) {
                try {
                    // Await the cookieStore promise before calling set
                    const store = await cookieStore;
                    cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options));
                } catch (error) {
                    // Ignore potential errors in Route Handlers during set
                }
            },
        },
    });
}

// Optional: Function to create a server client for Server Components using user context
// This might use NEXT_PUBLIC_SUPABASE_ANON_KEY if only public data is needed or
// could potentially read cookies if authentication state is required safely.
// For simplicity now, we focus on the service role client for backend operations.
/*
export function createServerComponentClient() {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        // ... implementation (might differ for anon key) ...
      }
    },
  })
}
*/