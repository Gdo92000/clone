import { useState, useMemo } from 'react';
import type { CartItem } from '../types';
import { calculateCartTotals } from '../useCases/cartUseCase';

const mockInitialItems: CartItem[] = [
  { id: 'c1', menuItemId: 'm1', restaurantId: '1', name: 'Pizza Margherita', price: 45.90, quantity: 1, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop', additives: [{ id: 'a1', name: 'Borda Recheada', price: 8.90 }] },
  { id: 'c2', menuItemId: 'm4', restaurantId: '1', name: 'Refrigerante Lata 350ml', price: 5.90, quantity: 2, imageUrl: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop' },
];

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(mockInitialItems);
  const { subtotal, deliveryFee, discount, total, itemsCount } = useMemo(() => calculateCartTotals(items), [items]);

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return { items, setItems, subtotal, deliveryFee, discount, total, itemsCount, updateQuantity, removeItem };
}