import { createClient } from '@supabase/supabase-js'
import { cacheStrategy } from './cache-strategy'

interface QueryOptions {
  limit?: number
  offset?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  cacheKey?: string
  cacheTTL?: number
}

export class SupabaseQuery {
  private static instance: SupabaseQuery
  private supabase: ReturnType<typeof createClient>

  private constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  static getInstance(): SupabaseQuery {
    if (!SupabaseQuery.instance) {
      SupabaseQuery.instance = new SupabaseQuery()
    }
    return SupabaseQuery.instance
  }

  async query<T>(
    table: string,
    columns: string[],
    options: QueryOptions = {}
  ): Promise<{ data: T[]; count: number }> {
    const {
      limit = 10,
      offset = 0,
      orderBy,
      orderDirection = 'desc',
      cacheKey,
      cacheTTL = 5 * 60 * 1000, // デフォルト5分
    } = options

    // キャッシュキーの生成
    const key = cacheKey || `${table}-${columns.join(',')}-${limit}-${offset}`

    // キャッシュからデータを取得
    const cached = await cacheStrategy.get(
      key,
      async () => {
        let query = this.supabase
          .from(table)
          .select(columns.join(','), { count: 'exact' })
          .range(offset, offset + limit - 1)

        if (orderBy) {
          query = query.order(orderBy, { ascending: orderDirection === 'asc' })
        }

        const { data, count, error } = await query

        if (error) {
          throw error
        }

        return { data, count }
      },
      { ttl: cacheTTL }
    )

    return cached
  }

  async getById<T>(
    table: string,
    id: string | number,
    columns: string[] = ['*']
  ): Promise<T | null> {
    const key = `${table}-${id}-${columns.join(',')}`

    return cacheStrategy.get(
      key,
      async () => {
        const { data, error } = await this.supabase
          .from(table)
          .select(columns.join(','))
          .eq('id', id)
          .single()

        if (error) {
          throw error
        }

        return data
      },
      { ttl: 5 * 60 * 1000 }
    )
  }

  async create<T>(
    table: string,
    data: Partial<T>
  ): Promise<{ data: T; error: any }> {
    const { data: result, error } = await this.supabase
      .from(table)
      .insert(data)
      .select()
      .single()

    if (!error) {
      // 関連するキャッシュを無効化
      cacheStrategy.invalidate(`${table}-*`)
    }

    return { data: result, error }
  }

  async update<T>(
    table: string,
    id: string | number,
    data: Partial<T>
  ): Promise<{ data: T; error: any }> {
    const { data: result, error } = await this.supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (!error) {
      // 関連するキャッシュを無効化
      cacheStrategy.invalidate(`${table}-*`)
    }

    return { data: result, error }
  }

  async delete(
    table: string,
    id: string | number
  ): Promise<{ error: any }> {
    const { error } = await this.supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (!error) {
      // 関連するキャッシュを無効化
      cacheStrategy.invalidate(`${table}-*`)
    }

    return { error }
  }
}

// シングルトンインスタンスをエクスポート
export const supabaseQuery = SupabaseQuery.getInstance() 