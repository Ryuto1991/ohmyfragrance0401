import { getSupabaseClient } from './supabase-client'

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  staleWhileRevalidate?: boolean
  revalidateOnFocus?: boolean
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  version: number
}

class CacheStrategy {
  private static instance: CacheStrategy
  private memoryCache: Map<string, CacheEntry<any>>
  private version: number

  private constructor() {
    this.memoryCache = new Map()
    this.version = 1
  }

  static getInstance(): CacheStrategy {
    if (!CacheStrategy.instance) {
      CacheStrategy.instance = new CacheStrategy()
    }
    return CacheStrategy.instance
  }

  async get<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const {
      ttl = 5 * 60 * 1000, // デフォルト5分
      staleWhileRevalidate = true,
      revalidateOnFocus = true,
    } = options

    const cached = this.memoryCache.get(key)
    const now = Date.now()

    // キャッシュが存在し、有効期限内の場合
    if (cached && now - cached.timestamp < ttl) {
      // バックグラウンドで再検証
      if (staleWhileRevalidate) {
        this.revalidate(key, fetchFn, ttl)
      }
      return cached.data
    }

    // キャッシュが存在しないか、期限切れの場合
    const data = await fetchFn()
    this.set(key, data, ttl)

    return data
  }

  private async revalidate<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number
  ): Promise<void> {
    try {
      const data = await fetchFn()
      this.set(key, data, ttl)
    } catch (error) {
      console.error('Cache revalidation failed:', error)
    }
  }

  set<T>(key: string, data: T, ttl: number): void {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      version: this.version,
    })

    // TTL後に自動的にキャッシュを削除
    setTimeout(() => {
      const entry = this.memoryCache.get(key)
      if (entry && entry.version === this.version) {
        this.memoryCache.delete(key)
      }
    }, ttl)
  }

  invalidate(key?: string): void {
    if (key) {
      this.memoryCache.delete(key)
    } else {
      this.memoryCache.clear()
      this.version++
    }
  }

  // キャッシュの状態を取得
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.memoryCache.size,
      keys: Array.from(this.memoryCache.keys()),
    }
  }

  // キャッシュのクリーンアップ
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > 24 * 60 * 60 * 1000) { // 24時間以上経過したキャッシュを削除
        this.memoryCache.delete(key)
      }
    }
  }
}

// キャッシュ戦略のインスタンスをエクスポート
export const cacheStrategy = CacheStrategy.getInstance()

// キャッシュフック
export function useCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await cacheStrategy.get(key, fetchFn, options)
        if (mounted) {
          setData(result)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'))
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    // フォーカス時の再検証
    if (options.revalidateOnFocus) {
      const handleFocus = () => {
        if (mounted) {
          fetchData()
        }
      }

      window.addEventListener('focus', handleFocus)
      return () => {
        window.removeEventListener('focus', handleFocus)
      }
    }

    return () => {
      mounted = false
    }
  }, [key, fetchFn, options])

  return { data, loading, error }
} 