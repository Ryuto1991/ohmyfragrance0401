// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}))

// Mock Supabase client
const mockSupabase = {
  auth: {
    signInWithOAuth: jest.fn().mockResolvedValue({ data: {}, error: null }),
    getSession: jest.fn().mockResolvedValue({ 
      data: { 
        session: { 
          expires_at: Math.floor((Date.now() + 3600000) / 1000), // Convert to Unix timestamp
          user: { email: 'test@gmail.com', email_confirmed_at: new Date() }
        }
      }, 
      error: null 
    }),
    getUser: jest.fn().mockResolvedValue({ 
      data: { 
        user: { 
          id: '123', 
          email: 'test@gmail.com',
          email_confirmed_at: new Date()
        }
      }, 
      error: null 
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
  },
  from: jest.fn(() => ({
    insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
  })),
}

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
})) 