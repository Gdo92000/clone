import type { Restaurant, MenuItem, Additive, Category } from '../types';
import type { RestaurantDTO, MenuItemDTO, AdditiveDTO, CategoryDTO } from '../dto/restaurantDto';

export function restaurantDtoToModel(dto: RestaurantDTO): Restaurant {
  const r: Restaurant = {
    id: dto.id, name: dto.name, description: dto.description, cuisine: dto.cuisine,
    rating: dto.rating, reviewCount: dto.review_count, deliveryTime: dto.delivery_time,
    deliveryFee: dto.delivery_fee, imageUrl: dto.image_url, bannerUrl: dto.banner_url,
    isFeatured: false, distance: dto.distance,
    ...(dto.city !== undefined && { city: dto.city }),
    ...(dto.coordinates !== undefined && { coordinates: dto.coordinates }),
  };
  if (dto.is_featured !== undefined) r.isFeatured = dto.is_featured;
  if (dto.promotional_offer !== undefined) r.promotionalOffer = dto.promotional_offer;
  return r;
}

export function menuItemDtoToModel(dto: MenuItemDTO): MenuItem {
  const mi: MenuItem = {
    id: dto.id, restaurantId: dto.restaurant_id, name: dto.name, description: dto.description,
    price: dto.price, originalPrice: 0, imageUrl: dto.image_url, category: dto.category,
    isAvailable: dto.is_available,
    ...(dto.additives !== undefined && { additives: dto.additives.map(additiveDtoToModel) }),
  };
  if (dto.original_price !== undefined) mi.originalPrice = dto.original_price;
  return mi;
}

export function additiveDtoToModel(dto: AdditiveDTO): Additive {
  return { id: dto.id, name: dto.name, price: dto.price };
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