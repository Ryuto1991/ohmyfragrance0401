import { Inter, Noto_Sans_JP } from 'next/font/google'

// 英語フォントの最適化
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  adjustFontFallback: false, // システムフォントを優先
})

// 日本語フォントの最適化（必要な文字セットのみ）
export const notoSansJP = Noto_Sans_JP({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  weight: ['400', '500', '700'], // 必要なウェイトのみ
  display: 'swap',
  variable: '--font-noto-sans-jp',
  preload: true,
  adjustFontFallback: false,
})

// フォントのフォールバック設定
export const fontFallback = {
  sans: [
    'var(--font-inter)',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
  jp: [
    'var(--font-noto-sans-jp)',
    'Hiragino Sans',
    'Hiragino Kaku Gothic ProN',
    'Meiryo',
    'sans-serif',
  ],
}

// フォントのプリロード設定
export const fontPreload = {
  inter: {
    rel: 'preload',
    href: '/fonts/inter-var.woff2',
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  },
  notoSansJP: {
    rel: 'preload',
    href: '/fonts/noto-sans-jp.woff2',
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  },
} 