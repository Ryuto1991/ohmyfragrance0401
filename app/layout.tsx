import { Inter } from "next/font/google";
import { Zen_Kaku_Gothic_New, Montserrat } from "next/font/google";
import { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { StripeCartProvider } from "@/contexts/stripe-cart-context";
import { AuthProvider } from "@/contexts/auth-context";
import { CartDrawerProvider } from "@/contexts/cart-drawer-context";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

// フォントの最適化
const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  variable: "--font-zen",
  // 日本語文字のサブセットを最適化
  subset: ["latin", "cyrillic", "japanese"],
  // 必要な文字のみを読み込む
  text: "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン",
});

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  variable: "--font-montserrat",
  // 必要な文字のみを読み込む
  text: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Oh My Fragrance",
  description: "Create your own custom fragrance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@400;500;700&family=Roboto:wght@400;500;700&family=Playfair+Display:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${zenKakuGothicNew.variable} ${montserrat.variable} ${inter.className} font-sans`} suppressHydrationWarning>
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
  );
}