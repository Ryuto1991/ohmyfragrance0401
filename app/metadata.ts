import { Metadata } from 'next'

const defaultMetadata = {
  title: 'Oh My Fragrance',
  description: 'あなただけのオリジナル香水を作成できるカスタムフレグランスサービス',
  keywords: '香水,フレグランス,カスタム,オリジナル,パーソナライズ',
  authors: [{ name: 'Oh My Fragrance Team' }],
  creator: 'Oh My Fragrance',
  publisher: 'Oh My Fragrance',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://oh-my-fragrance.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://oh-my-fragrance.vercel.app',
    title: 'Oh My Fragrance',
    description: 'あなただけのオリジナル香水を作成できるカスタムフレグランスサービス',
    siteName: 'Oh My Fragrance',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Oh My Fragrance',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oh My Fragrance',
    description: 'あなただけのオリジナル香水を作成できるカスタムフレグランスサービス',
    images: ['/og-image.jpg'],
    creator: '@ohmyfragrance',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'google-site-verification-code',
  },
} as const

export function generateMetadata(
  overrides: Partial<Metadata> = {}
): Metadata {
  return {
    ...defaultMetadata,
    ...overrides,
    openGraph: {
      ...defaultMetadata.openGraph,
      ...overrides.openGraph,
    },
    twitter: {
      ...defaultMetadata.twitter,
      ...overrides.twitter,
    },
  }
} 