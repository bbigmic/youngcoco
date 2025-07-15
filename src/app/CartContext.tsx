'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type CartItem = {
  variant: number; // 24, 12
  quantity: number; // może być większe niż 1
};

type CustomerData = {
  firstName: string;
  lastName: string;
  email: string;
  tel: string;
  street: string;
  house: string;
  zip: string;
  city: string;
  invoice: boolean;
  company?: string;
  nip?: string;
  invoiceStreet?: string;
  invoiceHouse?: string;
  invoiceZip?: string;
  invoiceCity?: string;
  consent1: boolean;
  consent2: boolean;
};

type CartContextType = {
  item: CartItem | null;
  addToCart: (variant: number) => void;
  clearCart: () => void;
  increaseQuantity: () => void;
  decreaseQuantity: () => void;
  customer: CustomerData | null;
  setCustomer: (data: CustomerData) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // Inicjalizuj z localStorage
  const [item, setItem] = useState<CartItem | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart-item');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  
  const [customer, setCustomer] = useState<CustomerData | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart-customer');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const addToCart = (variant: number) => {
    const newItem = { variant, quantity: 1 };
    setItem(newItem);
    localStorage.setItem('cart-item', JSON.stringify(newItem));
  };

  const clearCart = () => {
    setItem(null);
    localStorage.removeItem('cart-item');
    localStorage.removeItem('cart-customer');
  };

  const increaseQuantity = () => {
    if (item) {
      const newItem = { ...item, quantity: item.quantity + 1 };
      setItem(newItem);
      localStorage.setItem('cart-item', JSON.stringify(newItem));
    }
  };

  const decreaseQuantity = () => {
    if (item && item.quantity > 1) {
      const newItem = { ...item, quantity: item.quantity - 1 };
      setItem(newItem);
      localStorage.setItem('cart-item', JSON.stringify(newItem));
    }
  };

  const setCustomerData = (data: CustomerData) => {
    setCustomer(data);
    localStorage.setItem('cart-customer', JSON.stringify(data));
  };

  return (
    <CartContext.Provider value={{ item, addToCart, clearCart, increaseQuantity, decreaseQuantity, customer, setCustomer: setCustomerData }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
} 