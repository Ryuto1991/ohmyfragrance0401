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

export const metadata: Metadata = {
  title: "OMF - Online Fragrance Store",
  description: "Experience unique AI-generated fragrances",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${zenKakuGothicNew.variable} ${montserrat.variable} font-sans`} suppressHydrationWarning>
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