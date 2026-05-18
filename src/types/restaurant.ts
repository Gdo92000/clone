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
  distance: string;
  promotionalOffer?: string;
  city?: string;
  neighborhood?: string;
  address?: string;
  phone?: string;
  paymentMethods?: string;
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