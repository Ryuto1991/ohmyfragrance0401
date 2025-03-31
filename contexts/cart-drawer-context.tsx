'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// コンテキストの型定義
interface CartDrawerContextType {
  isCartOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;
}

// デフォルト値を持つコンテキストを作成
const CartDrawerContext = createContext<CartDrawerContextType | undefined>(undefined);

// プロバイダーコンポーネント
interface CartDrawerProviderProps {
  children: ReactNode;
}

export const CartDrawerProvider: React.FC<CartDrawerProviderProps> = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCartDrawer = () => setIsCartOpen(true);
  const closeCartDrawer = () => setIsCartOpen(false);
  const toggleCartDrawer = () => setIsCartOpen((prev) => !prev);

  return (
    <CartDrawerContext.Provider
      value={{
        isCartOpen,
        openCartDrawer,
        closeCartDrawer,
        toggleCartDrawer,
      }}
    >
      {children}
    </CartDrawerContext.Provider>
  );
};

// コンテキストを使用するためのカスタムフック
export const useCartDrawer = (): CartDrawerContextType => {
  const context = useContext(CartDrawerContext);
  if (context === undefined) {
    throw new Error('useCartDrawer must be used within a CartDrawerProvider');
  }
  return context;
}; 