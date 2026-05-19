import { useState, useMemo } from 'react';
import type { CartItem } from '../types';
import { calculateCartTotals } from '../useCases/cartUseCase';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const { subtotal, deliveryFee, discount, total, itemsCount } = useMemo(() => calculateCartTotals(items), [items]);

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return { items, setItems, subtotal, deliveryFee, discount, total, itemsCount, updateQuantity, removeItem };
}