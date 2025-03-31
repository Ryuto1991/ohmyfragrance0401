'use client';

import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStripeCart } from '@/contexts/stripe-cart-context';
import StripeCartDrawer from '@/components/stripe-cart-drawer';

export default function StripeCartButton() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { cartCount } = useStripeCart();

  return (
    <>
      <Button
        variant="ghost" // Or choose another variant that fits the header design
        size="icon"
        className="relative rounded-full" // Ensure button is round if using size="icon"
        onClick={() => setIsDrawerOpen(true)}
        aria-label={`ショッピングカート: ${cartCount}アイテム`}
      >
        <ShoppingBag className="h-5 w-5" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {cartCount}
          </span>
        )}
      </Button>
      <StripeCartDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </>
  );
} 