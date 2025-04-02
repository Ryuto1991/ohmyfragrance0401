import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // セキュリティヘッダーの追加
  res.headers.set('X-DNS-Prefetch-Control', 'on')
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.headers.set('X-Frame-Options', 'SAMEORIGIN')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co;"
  )

  // セッションの取得
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 管理画面へのアクセス制御
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // ユーザーのロールを確認
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // 認証が必要なページへのアクセス制御
  if (
    req.nextUrl.pathname.startsWith('/mypage') ||
    req.nextUrl.pathname.startsWith('/checkout')
  ) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/mypage/:path*',
    '/checkout/:path*',
    '/api/:path*',
  ],
} 