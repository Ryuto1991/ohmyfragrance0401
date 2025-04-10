import type { Metadata } from 'next'
import { Inter, Zen_Kaku_Gothic_New, Montserrat } from "next/font/google"
import "./globals.css"
import ClientLayout from './client-layout'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${inter.className} ${zenKakuGothicNew.variable} ${montserrat.variable}`}
        suppressHydrationWarning
      >
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
