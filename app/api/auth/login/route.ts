// 注: このファイルは現在使用していません。
// 必要になったら、コメントを外して再度有効化してください。

/*
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { RateLimiter } from '@/app/utils/rate-limit'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { email, password } = await request.json()

    // IPアドレスによるレート制限
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimiter = RateLimiter.getInstance()
    const { allowed, remaining } = await rateLimiter.checkRateLimit(ip, 'auth')

    if (!allowed) {
      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          remaining
        },
        { status: 429 }
      )
    }

    // ログイン処理
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    // ログイン成功時にレート制限をリセット
    await rateLimiter.resetRateLimit(ip, 'auth')

    return NextResponse.json({
      user: data.user,
      session: data.session
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
*/

// ダミーのハンドラーを追加して404を返す
export async function POST() {
  return new Response("Not implemented", { status: 404 });
}