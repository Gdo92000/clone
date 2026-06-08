import type { Restaurant, MenuItem, Category } from "@/types/restaurant";
import type { IRestaurantProvider } from "./IRestaurantProvider";
import {
  mockRestaurants as domainRestaurants,
} from "@/infrastructure/memory/data/restaurants";
import {
  mockMenuItems as domainMenuItems,
} from "@/infrastructure/memory/data/menu-items";
import {
  mockCategories as domainCategories,
} from "@/infrastructure/memory/data/categories";
import { RESTAURANT_LOCATIONS } from "@/infrastructure/memory/data/restaurant-locations";

function toUiRestaurant(d: typeof domainRestaurants[0]): Restaurant {
  const r: Restaurant = {
    id: d.id, name: d.name, description: d.description,
    cuisine: d.cuisine, rating: d.rating, reviewCount: d.reviewCount,
    deliveryTime: d.deliveryTime, deliveryFee: d.deliveryFee,
    imageUrl: d.imageUrl, bannerUrl: d.bannerUrl,
    distance: `${d.distance} km`,
    isActive: d.isActive,
    coverageZoneType: d.coverageZoneType,
  };
  if (d.isFeatured !== undefined) r.isFeatured = d.isFeatured;
  if (d.promotionalOffer) r.promotionalOffer = d.promotionalOffer;
  if (d.city) r.city = d.city;
  if (d.state) r.state = d.state;
  if (d.neighborhood) r.neighborhood = d.neighborhood;
  if (d.address) r.address = d.address;
  if (d.phone) r.phone = d.phone;
  if (d.paymentMethods) r.paymentMethods = d.paymentMethods.join(', ');
  if (d.coordinates) r.coordinates = { lat: d.coordinates.latitude, lng: d.coordinates.longitude };
  if (d.latitude !== undefined) r.latitude = d.latitude;
  if (d.longitude !== undefined) r.longitude = d.longitude;
  if (d.deliveryRadiusKm !== undefined) r.deliveryRadiusKm = d.deliveryRadiusKm;
  return r;
}

function toUiMenuItem(d: typeof domainMenuItems[0]): MenuItem {
  const mi: MenuItem = {
    id: d.id, restaurantId: d.restaurantId, name: d.name,
    description: d.description, price: d.price,
    imageUrl: d.imageUrl, category: d.category, isAvailable: d.isAvailable,
  };
  if (d.originalPrice) mi.originalPrice = d.originalPrice;
  if (d.additives) mi.additives = d.additives;
  return mi;
}

function withMockLocationMetadata(restaurants: Restaurant[]): Restaurant[] {
  return restaurants.map((restaurant) => ({
    ...restaurant,
    ...RESTAURANT_LOCATIONS[restaurant.id],
  }));
}

export class MockRestaurantProvider implements IRestaurantProvider {
  name = "mock";

  getAll(): Promise<Restaurant[]> {
    return Promise.resolve(
      withMockLocationMetadata(domainRestaurants.map(toUiRestaurant)),
    );
  }

  getById(id: string): Promise<Restaurant | undefined> {
    const r = domainRestaurants.find((r) => r.id === id);
    return Promise.resolve(
      r ? withMockLocationMetadata([toUiRestaurant(r)])[0] : undefined,
    );
  }

  getMenuItems(restaurantId?: string): Promise<MenuItem[]> {
    const items = restaurantId
      ? domainMenuItems.filter((m) => m.restaurantId === restaurantId)
      : domainMenuItems;
    return Promise.resolve(items.map(toUiMenuItem));
  }

  getMenuItemById(id: string): Promise<MenuItem | undefined> {
    const item = domainMenuItems.find((m) => m.id === id);
    return Promise.resolve(item ? toUiMenuItem(item) : undefined);
  }

  getCategories(): Promise<Category[]> {
    return Promise.resolve(domainCategories.map((c) => ({
      id: c.id, name: c.name, icon: c.icon, slug: c.slug,
    })));
  }
}
