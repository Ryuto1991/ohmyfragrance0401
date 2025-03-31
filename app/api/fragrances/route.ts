const supabase = createServerClient(supabaseUrl, supabaseServiceRoleKey, {
  cookies: {
    async getAll() {
      // Ensure cookieStore is awaited before calling getAll()
      const store = await cookieStore;
      return store.getAll();
    },
    async setAll(cookiesToSet) {
      try {
        // Ensure cookieStore is awaited before accessing its methods
        const store = await cookieStore;
        cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options));
      } catch (error) {
        // Ignore potential errors in Route Handlers during set
      }
    },
  },
}); 