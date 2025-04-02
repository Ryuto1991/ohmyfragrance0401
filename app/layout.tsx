import type { Metadata } from 'next'
import { Inter, Zen_Kaku_Gothic_New, Montserrat } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { StripeCartProvider } from "@/contexts/stripe-cart-context"
import { AuthProvider } from "@/contexts/auth-context"
import { CartDrawerProvider } from "@/contexts/cart-drawer-context"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { initializeSecurity } from './lib/init-security'

// フォントの最適化
const inter = Inter({ subsets: ["latin"] })
const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-zen-kaku-gothic-new",
})
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
})

export const metadata: Metadata = {
  title: 'Oh My Fragrance',
  description: 'Your personal fragrance collection manager',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // サーバーサイドでのみセキュリティ機能を初期化
  if (process.env.NODE_ENV === 'production') {
    await initializeSecurity()
  }

  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${inter.className} ${zenKakuGothicNew.variable} ${montserrat.variable}`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <StripeCartProvider>
              <CartDrawerProvider>
                {children}
                <Toaster />
                <Analytics />
                <SpeedInsights />
              </CartDrawerProvider>
            </StripeCartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}