export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  imageUrl: string;
  bannerUrl: string;
  isFeatured?: boolean;
  isActive: boolean;
  distance: string;
  promotionalOffer?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  address?: string;
  phone?: string;
  paymentMethods?: string;
  latitude?: number | null;
  longitude?: number | null;
  deliveryRadiusKm?: number | null;
  coverageZoneType: 'city' | 'neighborhood' | 'radius' | 'polygon';
  coveragePolygon?: unknown;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
  additives?: Additive[];
}

export interface Additive {
  id: string;
  name: string;
  price: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

export interface ActiveCity {
  city: string;
  state: string;
  restaurantCount: number;
}

export interface ActiveNeighborhood {
  neighborhood: string;
  city: string;
  state: string;
  restaurantCount: number;
}
