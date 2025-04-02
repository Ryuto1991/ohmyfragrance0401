'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define the structure of a cart item
interface CartItem {
  priceId: string; // Stripe Price ID
  quantity: number;
  // Add other product details if needed for display in the cart drawer
  name?: string;
  price?: number; // Unit price
  image?: string | null;
  customProductId?: string; // カスタム商品ID
  // カスタム香水の詳細情報
  customDetails?: {
    fragranceId: string;
    fragranceName: string;
    bottleId: string;
    bottleName: string;
    labelSize: string | null;
    labelType: 'template' | 'original';
    labelImageUrl?: string | null;
    originalImageUrl?: string | null;
    imageBase64?: string | null;
    imageTransform?: {
      x: number;
      y: number;
      scale: number;
      rotation: number;
    };
  };
}

// Define the shape of the context
interface StripeCartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (priceId: string, customProductId?: string) => void;
  updateQuantity: (priceId: string, quantity: number, customProductId?: string) => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
}

// Create the context with a default value
const StripeCartContext = createContext<StripeCartContextType | undefined>(undefined);

// Create the provider component
interface StripeCartProviderProps {
  children: ReactNode;
}

export const StripeCartProvider: React.FC<StripeCartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from local storage on initial render (optional but good for persistence)
  useEffect(() => {
    const storedCart = localStorage.getItem('stripeCart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
            setCartItems(parsedCart);
        }
      } catch (error) {
        console.error("Failed to parse cart from local storage", error);
        localStorage.removeItem('stripeCart'); // Clear corrupted data
      }
    }
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
        localStorage.setItem('stripeCart', JSON.stringify(cartItems));
    } else {
        // Clear local storage if cart is empty to avoid storing empty array string
        localStorage.removeItem('stripeCart');
    }
  }, [cartItems]);

  const addToCart = (itemToAdd: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => 
        itemToAdd.customProductId 
          ? item.customProductId === itemToAdd.customProductId 
          : item.priceId === itemToAdd.priceId
      );
      const addQuantity = itemToAdd.quantity ?? 1;
      if (existingItem) {
        // Increase quantity if item already exists
        return prevItems.map(item =>
          (itemToAdd.customProductId 
            ? item.customProductId === itemToAdd.customProductId 
            : item.priceId === itemToAdd.priceId)
            ? { ...item, quantity: item.quantity + addQuantity }
            : item
        );
      } else {
        // Add new item
        return [...prevItems, { ...itemToAdd, quantity: addQuantity }];
      }
    });
  };

  const removeFromCart = (priceId: string, customProductId?: string) => {
    setCartItems(prevItems => prevItems.filter(item => 
      customProductId 
        ? item.customProductId !== customProductId
        : item.priceId !== priceId
    ));
  };

  const updateQuantity = (priceId: string, quantity: number, customProductId?: string) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        (customProductId 
          ? item.customProductId === customProductId
          : item.priceId === priceId)
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      ).filter(item => item.quantity > 0) // Remove item if quantity becomes 0
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const totalPrice = cartItems.reduce((total, item) => {
    // Use item.price if available, otherwise assume 0 (or fetch price if needed)
    const itemPrice = item.price || 0;
    return total + itemPrice * item.quantity;
  }, 0);


  return (
    <StripeCartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, totalPrice }}>
      {children}
    </StripeCartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useStripeCart = (): StripeCartContextType => {
  const context = useContext(StripeCartContext);
  if (context === undefined) {
    throw new Error('useStripeCart must be used within a StripeCartProvider');
  }
  return context;
}; 