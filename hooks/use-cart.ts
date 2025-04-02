import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";

interface CartItem {
  id: string;
  fragranceId: string;
  quantity: number;
  fragrance: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
  };
}

interface Cart {
  id: string;
  items: CartItem[];
}

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) throw new Error("カートの取得に失敗しました");
      const data = await response.json();
      setCart(data.cart);
    } catch (error) {
      console.error("カート取得エラー:", error);
      toast({
        title: "エラーが発生しました",
        description: "カートの取得に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (fragranceId: string, quantity: number) => {
    if (!session?.user) {
      toast({
        title: "ログインが必要です",
        description: "カートに追加するにはログインしてください。",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fragranceId, quantity }),
      });

      if (!response.ok) throw new Error("カートの更新に失敗しました");

      const data = await response.json();
      setCart(data.cart);
      toast({
        title: "カートに追加しました",
        description: "商品をカートに追加しました。",
      });
    } catch (error) {
      console.error("カート更新エラー:", error);
      toast({
        title: "エラーが発生しました",
        description: "カートの更新に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("カートアイテムの削除に失敗しました");

      setCart((prevCart) => {
        if (!prevCart) return null;
        return {
          ...prevCart,
          items: prevCart.items.filter((item) => item.id !== itemId),
        };
      });

      toast({
        title: "カートから削除しました",
        description: "商品をカートから削除しました。",
      });
    } catch (error) {
      console.error("カートアイテム削除エラー:", error);
      toast({
        title: "エラーが発生しました",
        description: "カートアイテムの削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    if (!cart) return;

    try {
      await Promise.all(
        cart.items.map((item) =>
          fetch(`/api/cart?itemId=${item.id}`, {
            method: "DELETE",
          })
        )
      );

      setCart(null);
      toast({
        title: "カートを空にしました",
        description: "カート内の商品をすべて削除しました。",
      });
    } catch (error) {
      console.error("カートクリアエラー:", error);
      toast({
        title: "エラーが発生しました",
        description: "カートのクリアに失敗しました。",
        variant: "destructive",
      });
    }
  };

  return {
    cart,
    loading,
    addToCart,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
  };
} 