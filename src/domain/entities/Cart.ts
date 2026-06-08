export interface CartItemAdditive {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  restaurantId: string;
  name: string;
  price: number;
  quantity: number;
  additives?: CartItemAdditive[];
  imageUrl: string;
  notes?: string;
}

export interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
}
