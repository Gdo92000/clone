import type { Restaurant, MenuItem, Additive, Category } from '../types';
import type { RestaurantDTO, MenuItemDTO, AdditiveDTO, CategoryDTO } from '../dto/restaurantDto';
import { coerceNumericOrZero, coerceNumericOrUndefined } from '../utils/format';

export function restaurantDtoToModel(dto: RestaurantDTO): Restaurant {
  const latitude = coerceNumericOrUndefined(dto.latitude);
  const longitude = coerceNumericOrUndefined(dto.longitude);
  const r: Restaurant = {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    cuisine: dto.cuisine,
    rating: coerceNumericOrZero(dto.rating),
    reviewCount: dto.review_count,
    deliveryTime: dto.delivery_time,
    deliveryFee: coerceNumericOrZero(dto.delivery_fee),
    imageUrl: dto.image_url,
    bannerUrl: dto.banner_url,
    isFeatured: false,
    isActive: dto.is_active ?? true,
    distance: dto.distance,
    coverageZoneType: dto.coverage_zone_type ?? 'city',
    ...(dto.city !== undefined && { city: dto.city }),
    ...(dto.state !== undefined && { state: dto.state }),
    ...(dto.neighborhood !== undefined && { neighborhood: dto.neighborhood }),
    ...(dto.address !== undefined && { address: dto.address }),
    ...(dto.phone !== undefined && { phone: dto.phone }),
    ...(dto.payment_methods !== undefined && { paymentMethods: dto.payment_methods }),
    ...(latitude !== undefined && { latitude }),
    ...(longitude !== undefined && { longitude }),
    ...(dto.delivery_radius_km !== undefined && { deliveryRadiusKm: coerceNumericOrZero(dto.delivery_radius_km) }),
    ...(dto.coverage_polygon !== undefined && { coveragePolygon: dto.coverage_polygon }),
    ...(latitude !== undefined && longitude !== undefined && { coordinates: { lat: latitude, lng: longitude } }),
  };
  if (dto.is_featured !== undefined) r.isFeatured = dto.is_featured;
  if (dto.promotional_offer !== undefined) r.promotionalOffer = dto.promotional_offer;
  return r;
}

export function menuItemDtoToModel(dto: MenuItemDTO): MenuItem {
  const mi: MenuItem = {
    id: dto.id, restaurantId: dto.restaurant_id, name: dto.name, description: dto.description,
    price: coerceNumericOrZero(dto.price), originalPrice: 0, imageUrl: dto.image_url, category: dto.category,
    isAvailable: dto.is_available,
    ...(dto.additives !== undefined && { additives: dto.additives.map(additiveDtoToModel) }),
  };
  if (dto.original_price !== undefined) mi.originalPrice = coerceNumericOrZero(dto.original_price);
  return mi;
}

export function additiveDtoToModel(dto: AdditiveDTO): Additive {
  return { id: dto.id, name: dto.name, price: coerceNumericOrZero(dto.price) };
}

export function categoryDtoToModel(dto: CategoryDTO): Category {
  return { id: dto.id, name: dto.name, icon: dto.icon, slug: dto.slug };
}

export function restaurantListDtoToModel(dtos: RestaurantDTO[]): Restaurant[] {
  return dtos.map(restaurantDtoToModel);
}

export function menuItemListDtoToModel(dtos: MenuItemDTO[]): MenuItem[] {
  return dtos.map(menuItemDtoToModel);
}
