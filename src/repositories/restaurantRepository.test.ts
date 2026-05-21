vi.mock('../api', () => ({
  restaurantApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getMenuItems: vi.fn(),
    getMenuItemById: vi.fn(),
    getCategories: vi.fn(),
  },
}));

vi.mock('../mappers/restaurantMapper', () => ({
  restaurantListDtoToModel: vi.fn((data: unknown) => data),
  restaurantDtoToModel: vi.fn((data: unknown) => data),
  menuItemListDtoToModel: vi.fn((data: unknown) => data),
  menuItemDtoToModel: vi.fn((data: unknown) => data),
  categoryDtoToModel: vi.fn((data: unknown) => data),
}));

import type { RestaurantDTO, MenuItemDTO } from '../dto/restaurantDto';
import { restaurantApi } from '../api';
import {
  restaurantListDtoToModel,
  restaurantDtoToModel,
  menuItemListDtoToModel,
  categoryDtoToModel,
} from '../mappers/restaurantMapper';
import { getRestaurants, getRestaurantById, getMenuItems, getCategories } from './restaurantRepository';

describe('restaurantRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getRestaurants calls restaurantApi.getAll() and maps the result', async () => {
    const mockDto = [{ id: '1', name: 'Test Restaurant' }];
    vi.mocked(restaurantApi.getAll).mockResolvedValue(mockDto as unknown as RestaurantDTO[]);

    const result = await getRestaurants();

    expect(restaurantApi.getAll).toHaveBeenCalledTimes(1);
    expect(restaurantListDtoToModel).toHaveBeenCalledWith(mockDto);
    expect(result).toEqual(mockDto);
  });

  it('getRestaurants supports pagination with page/pageSize', async () => {
    const manyDtos = Array.from({ length: 30 }, (_, i) => ({
      id: String(i + 1),
      name: `Restaurant ${i + 1}`,
    }));
    vi.mocked(restaurantApi.getAll).mockResolvedValue(manyDtos as unknown as RestaurantDTO[]);

    const result = await getRestaurants(1, 10);

    expect(result).toHaveLength(10);
  });

  it('getRestaurantById calls restaurantApi.getById(id)', async () => {
    const mockDto = { id: '1', name: 'Single Restaurant' };
    vi.mocked(restaurantApi.getById).mockResolvedValue(mockDto as unknown as RestaurantDTO);

    const result = await getRestaurantById('1');

    expect(restaurantApi.getById).toHaveBeenCalledWith('1');
    expect(restaurantDtoToModel).toHaveBeenCalledWith(mockDto);
    expect(result).toEqual(mockDto);
  });

  it('getMenuItems calls restaurantApi.getMenuItems(restaurantId)', async () => {
    const mockDto = [{ id: 'm1', name: 'Item 1' }];
    vi.mocked(restaurantApi.getMenuItems).mockResolvedValue(mockDto as unknown as MenuItemDTO[]);

    const result = await getMenuItems('1');

    expect(restaurantApi.getMenuItems).toHaveBeenCalledWith('1');
    expect(menuItemListDtoToModel).toHaveBeenCalledWith(mockDto);
    expect(result).toEqual(mockDto);
  });

  it('getCategories calls restaurantApi.getCategories()', async () => {
    const mockDto = [
      { id: '1', name: 'Pizza', icon: '🍕', slug: 'pizza' },
      { id: '2', name: 'Hamburger', icon: '🍔', slug: 'hamburger' },
    ];
    vi.mocked(restaurantApi.getCategories).mockResolvedValue(mockDto);

    const result = await getCategories();

    expect(restaurantApi.getCategories).toHaveBeenCalledTimes(1);
    expect(categoryDtoToModel).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockDto);
  });
});
