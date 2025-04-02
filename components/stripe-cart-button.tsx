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
        variant="ghost"
        size="icon"
        className="relative rounded-full h-12 w-12"
        onClick={() => setIsDrawerOpen(true)}
        aria-label={`ショッピングカート: ${cartCount}アイテム`}
      >
        <ShoppingBag className="h-6 w-6" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {cartCount}
          </span>
        )}
      </Button>
      <StripeCartDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </>
  );
} 