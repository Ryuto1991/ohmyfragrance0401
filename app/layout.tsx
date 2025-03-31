import { Inter } from "next/font/google";
import { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { StripeCartProvider } from "@/contexts/stripe-cart-context";
import { AuthProvider } from "@/contexts/auth-context";
import { CartDrawerProvider } from "@/contexts/cart-drawer-context";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistSans } from "geist/font/sans";

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
      <body className={GeistSans.className}>
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
              </CartDrawerProvider>
            </StripeCartProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}