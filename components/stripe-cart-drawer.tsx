"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useStripeCart } from '@/contexts/stripe-cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Minus, Plus, Loader2 } from 'lucide-react';
import { getStripe } from "@/lib/stripe";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface StripeCartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StripeCartDrawer({ open, onOpenChange }: StripeCartDrawerProps) {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalPrice, cartCount } = useStripeCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { toast } = useToast();

  const handleQuantityChange = (priceId: string, customProductId: string | undefined, newQuantity: number) => {
    // 数値のバリデーション
    if (isNaN(newQuantity) || newQuantity < 1) {
      toast({
        title: "無効な数量",
        description: "数量は1以上の数値を入力してください。",
        variant: "destructive",
      });
      return;
    }

    const quantity = Math.max(1, newQuantity);
    updateQuantity(priceId, quantity, customProductId);
  };

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      console.log('Starting checkout with cart items:', cartItems);

      // ユーザーIDを取得
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      // 非ログインユーザー用のセッションID
      const anonymousId = localStorage.getItem('cartSessionId') || 
        Math.random().toString(36).substring(2, 15);
      localStorage.setItem('cartSessionId', anonymousId);

      // カスタム商品の注文詳細を収集（メタデータを圧縮）
      const orderDetails = cartItems
        .filter(item => item.customProductId)
        .map(item => ({
          i: item.customProductId,
          f: item.customDetails?.fragranceId || '',
          n: item.customDetails?.fragranceName || '',
          b: item.customDetails?.bottleId || '',
          bn: item.customDetails?.bottleName || '',
          s: item.customDetails?.labelSize || '',
          t: item.customDetails?.labelType || '',
          u: item.customDetails?.labelImageUrl || '',
          q: item.quantity,
          ...(item.customDetails?.imageTransform && {
            tr: {
              x: item.customDetails.imageTransform.x,
              y: item.customDetails.imageTransform.y,
              s: item.customDetails.imageTransform.scale,
              r: item.customDetails.imageTransform.rotation
            }
          })
        }));

      // カートの商品情報を準備
      const lineItems = cartItems.map(item => {
        console.log('Processing cart item:', item);
        if (!item.priceId) {
          console.error('Cart item missing priceId:', item);
          throw new Error('Invalid cart item: missing priceId');
        }
        return {
          price: item.priceId,
          quantity: item.quantity,
          adjustable_quantity: {
            enabled: true,
            minimum: 1,
            maximum: 99
          }
        };
      });

      console.log('Prepared line items:', lineItems);

      // カスタム商品が含まれている場合
      if (orderDetails.length > 0) {
        console.log('Processing custom product checkout');
        // 最初のカスタムアイテムから詳細情報を取得
        const firstCustomItem = cartItems.find(item => item.customProductId);
        if (!firstCustomItem || !firstCustomItem.customDetails) {
          throw new Error('カスタム商品の詳細情報が見つかりません');
        }
        const customDetails = firstCustomItem.customDetails;

        // 必須パラメータの検証 (customDetailsから取得)
        if (!customDetails.fragranceName || !customDetails.bottleName || !customDetails.labelImageUrl) {
          throw new Error('カスタム商品の必須情報が不足しています');
        }

        const checkoutResponse = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            line_items: lineItems,
            orderDetails: orderDetails, // orderDetailsは圧縮された情報
            // --- APIに渡すトップレベルの情報をcustomDetailsから取得 ---
            fragranceName: customDetails.fragranceName,
            bottleType: customDetails.bottleName,
            // imageKey, finalImageKey は削除
            originalImageUrl: customDetails.originalImageUrl,
            finalImageUrl: customDetails.finalImageUrl, // 追加: キャプチャ画像のURL
            recipe: customDetails.recipe,
            // DEBUG LOG: Check originalImageUrl before sending to API
            _debug_originalImageUrl: customDetails.originalImageUrl,
            mode: customDetails.recipe ? JSON.parse(customDetails.recipe).mode : 'custom', // recipeからmodeを抽出 (なければ'custom')
            // --- ここまで ---
            userId: userId,
            anonymousId: !userId ? anonymousId : undefined,
            customer_email: 'required',
            billing_address_collection: 'required',
            customer_creation: 'always',
            phone_number_collection: {
              enabled: true
            }
          }),
        });

        const checkoutData = await checkoutResponse.json();
        console.log('Checkout response:', checkoutData);

        if (!checkoutResponse.ok) {
          console.error('Checkout API Error:', checkoutData);
          throw new Error(checkoutData.error || 'Failed to create checkout session');
        }

        console.log('Created checkout session:', checkoutData.sessionId);

        const stripe = await getStripe();
        
        if (stripe) {
          // Check if running inside an iframe
          if (window.parent !== window) {
            // Send message to parent window to handle redirection
            window.parent.postMessage({
              type: 'stripeRedirect',
              sessionId: checkoutData.sessionId
            }, '*'); // Consider specifying a target origin instead of '*' for security
            console.log('Sent stripeRedirect message to parent window for custom product');
          } else {
            // Fallback for non-iframe environments
            const { error } = await stripe.redirectToCheckout({
              sessionId: checkoutData.sessionId
            });
            if (error) {
              console.error('Error redirecting to checkout:', error);
              throw error;
            }
          }
        }
      } else {
        // 通常の商品の場合
        console.log('Processing regular product checkout');
        const checkoutResponse = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            line_items: lineItems,
            customer_email: 'required',
            billing_address_collection: 'required',
            customer_creation: 'always',
            phone_number_collection: {
              enabled: true
            }
          }),
        });

        const checkoutData = await checkoutResponse.json();
        console.log('Checkout response:', checkoutData);

        if (!checkoutResponse.ok) {
          console.error('Checkout API Error:', checkoutData);
          throw new Error(checkoutData.error || 'Failed to create checkout session');
        }

        console.log('Created checkout session:', checkoutData.sessionId);

        const stripe = await getStripe();
        
        if (stripe) {
          // Check if running inside an iframe
          if (window.parent !== window) {
            // Send message to parent window to handle redirection
            window.parent.postMessage({
              type: 'stripeRedirect',
              sessionId: checkoutData.sessionId
            }, '*'); // Consider specifying a target origin instead of '*' for security
            console.log('Sent stripeRedirect message to parent window for regular product');
          } else {
            // Fallback for non-iframe environments
            const { error } = await stripe.redirectToCheckout({
              sessionId: checkoutData.sessionId
            });
            if (error) {
              console.error('Error redirecting to checkout:', error);
              throw error;
            }
          }
        }
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      toast({
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "決済処理中にエラーが発生しました。もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[90vw] sm:w-[540px] flex flex-col">
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
                  <div key={item.customProductId || item.priceId} className="flex items-start space-x-4 border-b pb-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name || '商品名不明'}
                        fill
                        sizes="(max-width: 768px) 80px, 80px"
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
                          onClick={() => handleQuantityChange(item.priceId, item.customProductId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (!isNaN(value) && value >= 1) {
                              handleQuantityChange(item.priceId, item.customProductId, value);
                            }
                          }}
                          className="h-7 w-12 text-center px-1"
                        />
                        <Button
                          variant="outline" size="icon" className="h-6 w-6"
                          onClick={() => handleQuantityChange(item.priceId, item.customProductId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-sm font-medium font-zen mb-2">
                        ¥{((item.price || 0) * item.quantity).toLocaleString()}
                      </p>
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCart(item.priceId, item.customProductId)}
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
