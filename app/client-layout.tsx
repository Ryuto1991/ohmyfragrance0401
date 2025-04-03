"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { StripeCartProvider } from "@/contexts/stripe-cart-context"
import { AuthProvider } from "@/contexts/auth-context"
import { CartDrawerProvider } from "@/contexts/cart-drawer-context"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { useToast } from "@/hooks/use-toast"
import { registerToast } from "@/lib/toast"
import { useEffect } from "react"

function ToastRegistrar() {
  const { toast } = useToast();
  
  useEffect(() => {
    registerToast(toast);
  }, [toast]);
  
  return null;
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <StripeCartProvider>
          <CartDrawerProvider>
            <ToastRegistrar />
            {children}
            <Toaster />
            <Analytics />
            <SpeedInsights />
          </CartDrawerProvider>
        </StripeCartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
} 