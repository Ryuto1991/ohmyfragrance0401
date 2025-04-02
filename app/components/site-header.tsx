'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStripeCart } from '@/contexts/stripe-cart-context'
import { useCartDrawer } from '@/contexts/cart-drawer-context'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { ShoppingCart, User, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useScrollPosition } from '@/lib/performance-utils'
import { MobileNav } from '@/components/mobile-nav'
import { MainNav } from '@/components/main-nav'
import { SearchBar } from '@/components/search-bar'
import { CartDrawer } from '@/components/cart-drawer'
import { UserNav } from '@/components/user-nav'

export function SiteHeader() {
  const pathname = usePathname()
  const { cart } = useStripeCart()
  const { openCart } = useCartDrawer()
  const { user, signOut } = useAuth()
  const scrollPosition = useScrollPosition()

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        scrollPosition > 0 && 'shadow-sm'
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center space-x-2"
            onClick={handleLogoClick}
          >
            <span className="font-bold">Oh My Fragrance</span>
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => openCart()}
          >
            <ShoppingCart className="h-5 w-5" />
            {cart?.items?.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {cart.items.length}
              </span>
            )}
          </Button>

          {user ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
            >
              <User className="h-5 w-5" />
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </nav>
      </div>
      <CartDrawer />
    </header>
  )
} 