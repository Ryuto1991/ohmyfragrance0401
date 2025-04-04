"use client";

import { useStripeCart } from '@/contexts/stripe-cart-context';
import StripeCartDrawer from '@/components/stripe-cart-drawer';
import { useState } from 'react';

export default function CartPage() {
  const { cartItems, totalPrice } = useStripeCart();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">ショッピングカート</h1>
      <StripeCartDrawer open={isOpen} onOpenChange={setIsOpen} />
    </div>
  );
} 