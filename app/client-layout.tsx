"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { StripeCartProvider } from "@/contexts/stripe-cart-context"
import { AuthProvider } from "@/contexts/auth-context"
import { CartDrawerProvider } from "@/contexts/cart-drawer-context";
// import { Toaster } from "@/components/ui/toaster"; // Comment out
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next"
// Remove unused imports: useToast, registerToast
// import { useToast } from "@/hooks/use-toast"
// import { registerToast } from "@/lib/toast";
import { useEffect, useState } from "react"; // Import useState

// function ToastRegistrar() { // Comment out
//   const { toast } = useToast();
//
//   useEffect(() => {
//     registerToast(toast);
//   }, [toast]);
//
//   return null;
// }

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Render children only after the component has mounted on the client
  if (!isMounted) {
    // Render nothing or a basic fallback during SSR and initial client render
    // This helps prevent hydration mismatches caused by client-only logic like themes
    return null;
    // Alternatively, return a basic structure if needed, but ensure it matches SSR output
    // return <>{children}</>; // Be cautious with this if children have client logic
  }

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
            {/* <ToastRegistrar /> */} {/* Comment out */}
            {children}
            {/* <Toaster /> */} {/* Comment out */}
            <Analytics />
            <SpeedInsights />
          </CartDrawerProvider>
        </StripeCartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
