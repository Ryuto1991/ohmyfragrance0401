import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 保護されたルートのパターン
const PROTECTED_ROUTES = [
  '/mypage',
  '/settings',
  '/favorites',
  '/checkout',
]

// 認証済みユーザーのみがアクセスできないルート
const AUTH_ROUTES = [
  '/login',
  '/signup',
  '/reset-password',
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const path = req.nextUrl.pathname
  
  // 大文字のFragrance-Labを小文字のfragrance-labにリダイレクト
  if (path.startsWith('/Fragrance-Lab')) {
    const newPath = path.replace('/Fragrance-Lab', '/fragrance-lab')
    const redirectUrl = new URL(newPath, req.url)
    // クエリパラメータを維持
    req.nextUrl.searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value)
    })
    return NextResponse.redirect(redirectUrl)
  }
  
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // 保護されたルートへのアクセスチェック
  if (PROTECTED_ROUTES.some(route => path.startsWith(route))) {
    if (!session) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // 認証済みユーザーの認証ページへのアクセスを防止
  if (AUTH_ROUTES.some(route => path.startsWith(route))) {
    if (session) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // セッションの更新
  await supabase.auth.getSession()

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
} 