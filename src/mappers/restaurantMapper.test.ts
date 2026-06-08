import { describe, it, expect } from 'vitest';
import { restaurantDtoToModel, menuItemDtoToModel, additiveDtoToModel } from './restaurantMapper';
import { addressDtoToModel } from './addressMapper';
import { menuItemDtoToModel as merchantMenuDtoToModel, orderDtoToModel, branchDtoToModel } from './merchantMapper';
import type { RestaurantDTO, MenuItemDTO, AdditiveDTO } from '../dto/restaurantDto';
import type { AddressDTO } from '../dto/addressDto';
import type { MerchantBranchDTO, MerchantMenuItemDTO, MerchantOrderDTO } from '../dto/merchantDto';

const baseRestaurant: RestaurantDTO = {
  id: 'r-1',
  name: 'Test',
  description: 'd',
  cuisine: 'pizza',
  rating: 4.5,
  review_count: 10,
  delivery_time: '30-40',
  delivery_fee: 5,
  image_url: '',
  banner_url: '',
  is_active: true,
  distance: '0 km',
};

const baseMenuItem: MenuItemDTO = {
  id: 'm-1',
  restaurant_id: 'r-1',
  name: 'Item',
  description: '',
  price: 10,
  image_url: '',
  category: 'pizza',
  is_available: true,
};

const baseAdditive: AdditiveDTO = { id: 'a-1', name: 'Bacon', price: 2 };

const baseAddress: AddressDTO = {
  id: 'ad-1',
  user_id: 'u-1',
  label: 'Casa',
  street: 'Rua',
  number: '100',
  complement: null,
  neighborhood: null,
  city: 'Franca',
  state: 'SP',
  zip_code: null,
  latitude: null,
  longitude: null,
  is_default: true,
  created_at: '2026-01-01',
};

const baseBranch: MerchantBranchDTO = {
  id: 'b-1',
  company_id: 'c-1',
  name: 'Filial',
  cep: null,
  address: 'Av',
  number: null,
  neighborhood: 'Centro',
  city: 'Franca',
  state: 'SP',
  latitude: null,
  longitude: null,
  delivery_radius_km: 5,
};

const baseMerchantMenu: MerchantMenuItemDTO = {
  id: 'mi-1',
  branch_id: 'b-1',
  name: 'Item',
  category: 'pizza',
  price: 10,
  is_available: true,
  description: '',
};

const baseMerchantOrder: MerchantOrderDTO = {
  id: 'o-1',
  branch_id: 'b-1',
  customer_name: 'A',
  customer_address: 'Rua',
  created_at: '2026-01-01',
  status: 'pending',
  payment_method: 'pix',
  delivery_type: 'delivery',
  total: 50,
  items: [{ name: 'Pizza', quantity: 1, price: 50 }],
};

describe('restaurantDtoToModel — coerção NUMERIC string → number', () => {
  it('converte delivery_fee string (Postgres NUMERIC) para number', () => {
    const dto: RestaurantDTO = { ...baseRestaurant, delivery_fee: '5.50' as unknown as number };
    const r = restaurantDtoToModel(dto);
    expect(r.deliveryFee).toBe(5.5);
    expect(typeof r.deliveryFee).toBe('number');
  });

  it('converte rating string (NUMERIC(3,2)) para number', () => {
    const dto: RestaurantDTO = { ...baseRestaurant, rating: '4.75' as unknown as number };
    const r = restaurantDtoToModel(dto);
    expect(r.rating).toBe(4.75);
    expect(typeof r.rating).toBe('number');
  });

  it('converte latitude string (NUMERIC(10,7)) para number', () => {
    const dto: RestaurantDTO = { ...baseRestaurant, latitude: '-20.5386000' as unknown as number, longitude: '-47.4008000' as unknown as number };
    const r = restaurantDtoToModel(dto);
    expect(r.latitude).toBe(-20.5386);
    expect(r.longitude).toBe(-47.4008);
    expect(r.coordinates).toEqual({ lat: -20.5386, lng: -47.4008 });
  });

  it('preserva number quando já é number (PC com MSW)', () => {
    const dto: RestaurantDTO = { ...baseRestaurant, delivery_fee: 5.5, rating: 4.5 };
    const r = restaurantDtoToModel(dto);
    expect(r.deliveryFee).toBe(5.5);
    expect(r.rating).toBe(4.5);
  });

  it('não quebra com delivery_fee null (coalesce para 0)', () => {
    const dto: RestaurantDTO = { ...baseRestaurant, delivery_fee: null as unknown as number };
    const r = restaurantDtoToModel(dto);
    expect(r.deliveryFee).toBe(0);
  });

  it('coerce delivery_radius_km string para number', () => {
    const dto: RestaurantDTO = { ...baseRestaurant, delivery_radius_km: '10' as unknown as number };
    const r = restaurantDtoToModel(dto);
    expect(r.deliveryRadiusKm).toBe(10);
  });

  it('NÃO popula coordinates se lat/lng faltam (mesmo sendo um ou outro presente)', () => {
    const dto: RestaurantDTO = { ...baseRestaurant, latitude: '-20.5' as unknown as number };
    const r = restaurantDtoToModel(dto);
    expect(r.coordinates).toBeUndefined();
  });
});

describe('menuItemDtoToModel — coerção NUMERIC string → number', () => {
  it('converte price string para number', () => {
    const dto: MenuItemDTO = { ...baseMenuItem, price: '19.90' as unknown as number };
    const mi = menuItemDtoToModel(dto);
    expect(mi.price).toBe(19.9);
    expect(typeof mi.price).toBe('number');
  });

  it('converte original_price string para number', () => {
    const dto: MenuItemDTO = { ...baseMenuItem, original_price: '29.90' as unknown as number };
    const mi = menuItemDtoToModel(dto);
    expect(mi.originalPrice).toBe(29.9);
  });

  it('price null vira 0', () => {
    const dto: MenuItemDTO = { ...baseMenuItem, price: null as unknown as number };
    const mi = menuItemDtoToModel(dto);
    expect(mi.price).toBe(0);
  });
});

describe('additiveDtoToModel — coerção NUMERIC', () => {
  it('converte price string para number', () => {
    const dto: AdditiveDTO = { ...baseAdditive, price: '3.50' as unknown as number };
    const a = additiveDtoToModel(dto);
    expect(a.price).toBe(3.5);
  });
});

describe('addressDtoToModel — coerção lat/lng NUMERIC', () => {
  it('converte latitude/longitude string para number', () => {
    const dto: AddressDTO = { ...baseAddress, latitude: '-20.5' as unknown as number, longitude: '-47.4' as unknown as number };
    const a = addressDtoToModel(dto);
    expect(a.coordinates).toEqual({ lat: -20.5, lng: -47.4 });
  });

  it('sem latitude/longitude, não popula coordinates', () => {
    const dto: AddressDTO = { ...baseAddress, latitude: null, longitude: null };
    const a = addressDtoToModel(dto);
    expect(a.coordinates).toBeUndefined();
  });
});

describe('merchantMapper — coerção NUMERIC', () => {
  it('branchDtoToModel: latitude/longitude/delivery_radius_km string → number', () => {
    const dto: MerchantBranchDTO = {
      ...baseBranch,
      latitude: '-20.5' as unknown as number,
      longitude: '-47.4' as unknown as number,
      delivery_radius_km: '15' as unknown as number,
    };
    const b = branchDtoToModel(dto);
    expect(b.coordinates).toEqual({ lat: -20.5, lng: -47.4 });
    expect(b.deliveryRadiusKm).toBe(15);
  });

  it('menuItemDtoToModel (merchant): price string → number', () => {
    const dto: MerchantMenuItemDTO = { ...baseMerchantMenu, price: '12.90' as unknown as number };
    const mi = merchantMenuDtoToModel(dto);
    expect(mi.price).toBe(12.9);
  });

  it('orderDtoToModel: total e items.price string → number', () => {
    const dto: MerchantOrderDTO = {
      ...baseMerchantOrder,
      total: '99.90' as unknown as number,
      items: [{ name: 'Pizza', quantity: 2, price: '49.95' as unknown as number }],
    };
    const o = orderDtoToModel(dto);
    expect(o.total).toBe(99.9);
    expect(o.items[0]?.price).toBe(49.95);
  });
});
