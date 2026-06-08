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
  is_active?: boolean;
  distance: string;
  promotional_offer?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  address?: string;
  phone?: string;
  payment_methods?: string;
  latitude?: number | null;
  longitude?: number | null;
  delivery_radius_km?: number | null;
  coverage_zone_type?: 'city' | 'neighborhood' | 'radius' | 'polygon';
  coverage_polygon?: unknown;
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

export interface ActiveCityDTO {
  city: string;
  state: string;
  restaurant_count: number;
}

export interface ActiveNeighborhoodDTO {
  neighborhood: string;
  city: string;
  state: string;
  restaurant_count: number;
}

export interface RestaurantAvailabilityDTO {
  id: string;
  is_active: boolean;
}
