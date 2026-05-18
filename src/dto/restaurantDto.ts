/* API contracts — these may differ from UI models when backend is integrated */

export interface RestaurantDTO {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  rating: number;
  review_count: number;
  delivery_time: string;
  delivery_fee: number;
  image_url: string;
  banner_url: string;
  is_featured?: boolean;
  distance: string;
  promotional_offer?: string;
  city?: string;
  coordinates?: { lat: number; lng: number };
}

export interface MenuItemDTO {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
  category: string;
  is_available: boolean;
  additives?: AdditiveDTO[];
}

export interface AdditiveDTO {
  id: string;
  name: string;
  price: number;
}

export interface CategoryDTO {
  id: string;
  name: string;
  icon: string;
  slug: string;
}