// 代わりにメインのsupabaseクライアントを使用
import { supabase, getSupabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

// 型情報を追加してexport（既存のコードとの互換性を保つため）
export { supabase };

// 明示的にデータベース型を付与する場合に使用するヘルパー関数
export function getTypedSupabase() {
  return supabase as unknown as ReturnType<typeof import('@supabase/auth-helpers-nextjs').createClientComponentClient<Database>>;
}

export default supabase;