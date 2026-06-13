import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../repositories/merchantRepository', () => ({
  getOrders: vi.fn(),
  getOrdersByBranch: vi.fn(),
}));

import { getOrders, getOrdersByBranch } from '../../repositories/merchantRepository';
import { useKdsOrders } from '../../hooks/useMerchantData';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useKdsOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls getOrders when no branchId is provided', async () => {
    const mockOrders = [
      { id: '1', customerName: 'João', status: 'new', total: 25.5 },
      { id: '2', customerName: 'Maria', status: 'accepted', total: 42.0 },
    ];
    vi.mocked(getOrders).mockResolvedValue(mockOrders as never);

    const { result } = renderHook(() => useKdsOrders(), { wrapper: createWrapper() });

    await waitFor(() => { expect(result.current.isSuccess).toBe(true); });
    expect(result.current.data).toEqual(mockOrders);
    expect(getOrders).toHaveBeenCalledTimes(1);
    expect(getOrdersByBranch).not.toHaveBeenCalled();
  });

  it('calls getOrdersByBranch when branchId is provided', async () => {
    const mockOrders = [
      { id: '3', customerName: 'Ana', status: 'preparing', total: 35.0 },
    ];
    vi.mocked(getOrdersByBranch).mockResolvedValue(mockOrders as never);

    const { result } = renderHook(() => useKdsOrders('branch-1'), { wrapper: createWrapper() });

    await waitFor(() => { expect(result.current.isSuccess).toBe(true); });
    expect(result.current.data).toEqual(mockOrders);
    expect(getOrdersByBranch).toHaveBeenCalledWith('branch-1');
    expect(getOrders).not.toHaveBeenCalled();
  });

  it('has staleTime of 0 for real-time updates', async () => {
    vi.mocked(getOrders).mockResolvedValue([] as never);

    const { result } = renderHook(() => useKdsOrders(), { wrapper: createWrapper() });

    await waitFor(() => { expect(result.current.isSuccess).toBe(true); });
    // staleTime: 0 means data is considered stale immediately
    // This is important for KDS to pick up SSE updates
    expect(getOrders).toHaveBeenCalledTimes(1);
  });

  it('returns empty array on initial load before data arrives', () => {
    vi.mocked(getOrders).mockResolvedValue(new Promise(() => {})); // never resolves

    const { result } = renderHook(() => useKdsOrders(), { wrapper: createWrapper() });

    expect(result.current.data).toBeUndefined();
  });

  it('returns empty array on initial load before data arrives', () => {
    vi.mocked(getOrders).mockReturnValue(new Promise(() => {})); // never resolves

    const { result } = renderHook(() => useKdsOrders(), { wrapper: createWrapper() });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
  });

  it('handles error state', async () => {
    vi.mocked(getOrders).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useKdsOrders(), { wrapper: createWrapper() });

    await waitFor(() => { expect(result.current.isError).toBe(true); });
    expect(result.current.error).toBeDefined();
  });

  it('switches to getOrders when branchId changes from specific to all', async () => {
    vi.mocked(getOrdersByBranch).mockResolvedValue([] as never);
    vi.mocked(getOrders).mockResolvedValue([] as never);

    const { result, rerender } = renderHook(
      (branchId: string | undefined) => useKdsOrders(branchId),
      { initialProps: 'branch-1', wrapper: createWrapper() },
    );

    await waitFor(() => { expect(result.current.isSuccess).toBe(true); });
    expect(getOrdersByBranch).toHaveBeenCalledWith('branch-1');

    // Rerender with undefined (all branches)
    rerender(undefined);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(getOrders).toHaveBeenCalledTimes(1);
  });
});
