import { Database } from '@/types/supabase'
// メインのシングルトンを使用
import { supabase, getSupabase } from '@/lib/supabase'

// 型付きクライアントを取得する関数
export function getSupabaseClient() {
  return supabase as unknown as ReturnType<typeof import('@supabase/supabase-js').createClient<Database>>;
}

// キャッシュ用のMap
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5分

export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  const data = await fetchFn()
  cache.set(key, { data, timestamp: Date.now() })
  return data
}

// キャッシュのクリア
export function clearCache(key?: string) {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}

// 定期的なキャッシュクリーンアップ
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key)
    }
  }
}, CACHE_DURATION)