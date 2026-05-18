import type { CartItem } from '../types';

const DELIVERY_FEE = 5.90;

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const additivesTotal = item.additives?.reduce((sum, a) => sum + a.price, 0) ?? 0;
    return total + (item.price + additivesTotal) * item.quantity;
  }, 0);
}

export function calculateDeliveryFee(subtotal: number): number {
  return subtotal > 0 ? DELIVERY_FEE : 0;
}

export function calculateTotal(subtotal: number, deliveryFee: number, discount = 0): number {
  return subtotal + deliveryFee - discount;
}

export function calculateItemsCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}

export interface CartTotals {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  itemsCount: number;
}

export function calculateCartTotals(items: CartItem[], discount = 0): CartTotals {
  const subtotal = calculateSubtotal(items);
  const deliveryFee = calculateDeliveryFee(subtotal);
  return { subtotal, deliveryFee, discount, total: calculateTotal(subtotal, deliveryFee, discount), itemsCount: calculateItemsCount(items) };
}