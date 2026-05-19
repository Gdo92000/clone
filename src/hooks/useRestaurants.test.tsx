import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../repositories/restaurantRepository', () => ({
  getRestaurants: vi.fn(),
  getRestaurantById: vi.fn(),
  getMenuItems: vi.fn(),
  getMenuItemById: vi.fn(),
  getCategories: vi.fn(),
}));

import { getRestaurants, getRestaurantById, getMenuItems, getCategories } from '../repositories/restaurantRepository';
import { useRestaurants, useRestaurant, useMenuItems, useCategories } from './useRestaurants';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useRestaurants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls getRestaurants and returns data', async () => {
    const mockData = [{ id: '1', name: 'Test Restaurant' }];
    vi.mocked(getRestaurants).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useRestaurants(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(getRestaurants).toHaveBeenCalledTimes(1);
  });

  it('useRestaurant with undefined id does NOT fetch', async () => {
    const { result } = renderHook(() => useRestaurant(undefined), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isFetching).toBe(false));
    expect(getRestaurantById).not.toHaveBeenCalled();
  });

  it('useRestaurant with valid id fetches that restaurant', async () => {
    const mockRestaurant = { id: '1', name: 'Test Restaurant' };
    vi.mocked(getRestaurantById).mockResolvedValue(mockRestaurant as any);

    const { result } = renderHook(() => useRestaurant('1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockRestaurant);
    expect(getRestaurantById).toHaveBeenCalledWith('1');
  });

  it('useMenuItems fetches menu items for restaurant', async () => {
    const mockItems = [{ id: 'm1', name: 'Item 1' }];
    vi.mocked(getMenuItems).mockResolvedValue(mockItems as any);

    const { result } = renderHook(() => useMenuItems('1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockItems);
    expect(getMenuItems).toHaveBeenCalledWith('1');
  });

  it('useCategories fetches categories', async () => {
    const mockCategories = [{ id: '1', name: 'Pizza' }];
    vi.mocked(getCategories).mockResolvedValue(mockCategories as any);

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockCategories);
    expect(getCategories).toHaveBeenCalledTimes(1);
  });
});
