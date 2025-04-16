import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// グローバル変数としてインスタンスを保持
let supabaseInstance: ReturnType<typeof createClient> | null = null

// シングルトンパターンを使用してクライアントを取得
export function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  }
  return supabaseInstance
}

// 直接エクスポートするクライアントインスタンス
export const supabase = getSupabase()