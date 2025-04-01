'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useStripeCart } from '@/contexts/stripe-cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Minus, Plus, Loader2 } from 'lucide-react';
import { getStripe } from "@/lib/stripe";

interface StripeCartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StripeCartDrawer({ open, onOpenChange }: StripeCartDrawerProps) {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalPrice, cartCount } = useStripeCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = (priceId: string, newQuantity: number) => {
    const quantity = Math.max(1, newQuantity); // Ensure quantity is at least 1
    updateQuantity(priceId, quantity);
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // Prepare line items for Stripe Checkout API
      const lineItems = cartItems.map(item => ({
        price: item.priceId,
        quantity: item.quantity,
      }));

      if (lineItems.length === 0) {
          console.error("Cart is empty, cannot proceed to checkout.");
          // Maybe show a message to the user
          setIsCheckingOut(false);
          return;
      }

      const response = await fetch('/api/checkout', { // Use the existing checkout API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ line_items: lineItems }), // Send line_items array
      });

      if (!response.ok) {
        // レスポンスからエラー情報を取得
        const errorData = await response.json();
        console.error("Checkout API Error:", errorData);
        throw new Error(`Checkout failed: ${errorData.error || `Status ${response.status}`}`);
      }

      const { sessionId } = await response.json();
      const stripe = await getStripe();

      if (!stripe) {
        throw new Error("Stripe.js failed to load.");
      }

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error("Stripe checkout error:", error);
        // Handle error (e.g., show message)
      }
      // If redirection is successful, this part might not be reached

    } catch (error) {
      console.error("Checkout failed:", error);
      // Handle error (e.g., show message)
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader className="mb-4">
          <SheetTitle>ショッピングカート ({cartCount})</SheetTitle>
        </SheetHeader>
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground font-zen">カートは空です。</p>
            <SheetClose asChild>
                <Button variant="link" className="mt-4 font-zen">買い物を続ける</Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 pr-6 -mr-6 mb-4">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.priceId} className="flex items-start space-x-4 border-b pb-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name || 'Product Image'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div>
                        <h3 className="text-sm font-medium font-zen">{item.name || '商品名不明'}</h3>
                        <p className="text-sm text-muted-foreground font-zen">
                          価格: ¥{(item.price || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          variant="outline" size="icon" className="h-6 w-6"
                          onClick={() => handleQuantityChange(item.priceId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.priceId, parseInt(e.target.value, 10) || 1)}
                          className="h-7 w-12 text-center px-1"
                        />
                        <Button
                          variant="outline" size="icon" className="h-6 w-6"
                          onClick={() => handleQuantityChange(item.priceId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className="text-sm font-medium font-zen mb-2">
                            ¥{( (item.price || 0) * item.quantity).toLocaleString()}
                        </p>
                        <Button
                            variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeFromCart(item.priceId)}
                            aria-label="削除"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="mt-auto border-t">
              <div className="flex flex-col w-full gap-4 pt-6">
                <div className="flex justify-between text-base font-medium text-gray-900 dark:text-gray-100 font-zen">
                  <p>合計金額</p>
                  <p>¥{totalPrice.toLocaleString()}</p>
                </div>
                <p className="text-xs text-muted-foreground font-zen">送料・手数料は購入手続き時に計算されます。</p>
                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || cartItems.length === 0}
                  className="w-full rounded-full"
                >
                  {isCheckingOut ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 処理中...</>
                  ) : (
                      'レジに進む'
                  )}
                </Button>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" onClick={clearCart} className="rounded-full font-zen" disabled={cartItems.length === 0}>
                    カートを空にする
                  </Button>
                  <SheetClose asChild>
                    <Button variant="link" className="font-zen">買い物を続ける</Button>
                  </SheetClose>
                </div>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
} 