import { supabase } from '@/lib/supabase'
import { authCache } from './auth-cache'
import { rateLimiter } from './rate-limit'

export async function verifyAuth(identifier: string) {
  try {
    // レート制限のチェック
    if (rateLimiter.isRateLimited(identifier)) {
      const remainingTime = rateLimiter.getTimeUntilReset(identifier);
      return {
        success: false,
        error: `試行回数が多すぎます。${Math.ceil(remainingTime / 1000)}秒後に再度お試しください。`,
        status: 'rate_limited',
      }
    }

    // キャッシュからセッションを取得
    const cachedSession = authCache.getSession()
    if (cachedSession) {
      return {
        success: true,
        user: cachedSession.user,
        status: 'authenticated',
      }
    }

    // セッションとユーザー情報を並列で取得
    const [sessionResult, userResult] = await Promise.all([
      supabase.auth.getSession(),
      supabase.auth.getUser(),
    ])

    const { data: { session }, error: sessionError } = sessionResult
    const { data: { user }, error: userError } = userResult

    if (sessionError) throw sessionError
    if (userError) throw userError

    // セッションが存在しない場合
    if (!session) {
      return {
        success: false,
        error: 'セッションが見つかりません',
        status: 'unauthenticated',
      }
    }

    // セッションの有効期限チェック
    const expiresAt = new Date(session.expires_at! * 1000)
    const now = new Date()
    if (expiresAt.getTime() < now.getTime()) {
      return {
        success: false,
        error: 'セッションの有効期限が切れています',
        status: 'expired',
      }
    }

    // メール認証状態の確認
    if (!user?.email_confirmed_at) {
      return {
        success: false,
        error: 'メールアドレスが未認証です',
        status: 'unverified',
        user,
      }
    }

    // セッションをキャッシュに保存
    if (session && 
        typeof session.expires_at === 'number' &&
        session.user && 
        typeof session.user.email === 'string') {
      authCache.setSession({
        expires_at: session.expires_at,
        user: {
          id: session.user.id,
          email: session.user.email,
          email_confirmed_at: session.user.email_confirmed_at || null,
        }
      });
    } else {
      // 条件を満たさない場合はキャッシュを無効化
      authCache.invalidate();
      console.warn('verifyAuth: Session, expires_at, user, or user.email is invalid, invalidating cache.');
    }

    // ログイン履歴の記録（非同期で実行）
    const { error: insertError } = await supabase.from('login_history').insert([
      {
        user_id: user.id,
        email: user.email,
        status: 'success',
        device: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      }
    ]);

    if (insertError) {
      console.error('ログイン履歴の記録に失敗:', insertError);
    }

    // 成功時にレート制限をリセット
    rateLimiter.reset(identifier)

    return {
      success: true,
      user,
      status: 'authenticated',
    }
  } catch (error) {
    console.error('認証検証エラー:', error)
    return {
      success: false,
      error: '認証の検証中にエラーが発生しました',
      status: 'error',
    }
  }
}

export async function verifyProvider(provider: string, identifier: string) {
  try {
    // レート制限のチェック
    if (rateLimiter.isRateLimited(identifier)) {
      const remainingTime = rateLimiter.getTimeUntilReset(identifier);
      return {
        success: false,
        error: `試行回数が多すぎます。${Math.ceil(remainingTime / 1000)}秒後に再度お試しください。`,
      }
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) throw error

    // キャッシュを無効化
    authCache.invalidate()

    // 成功時にレート制限をリセット
    rateLimiter.reset(identifier)

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error(`${provider}認証エラー:`, error)
    return {
      success: false,
      error: `${provider}認証に失敗しました`,
    }
  }
} 