import type { Additive } from './restaurant';

export interface CartItem {
  id: string;
  menuItemId: string;
  restaurantId: string;
  name: string;
  price: number;
  quantity: number;
  additives?: Additive[];
  imageUrl: string;
  notes?: string;
}

export interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
}

export const initialCartState: CartState = {
  items: [],
  restaurantId: null,
  restaurantName: null,
};

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const additivesTotal = item.additives?.reduce((sum, a) => sum + a.price, 0) ?? 0;
    return total + (item.price + additivesTotal) * item.quantity;
  }, 0);
}

export function getItemsCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}