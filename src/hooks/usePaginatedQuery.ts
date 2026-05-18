import { useState, useEffect, useRef, useCallback } from 'react';

interface PaginatedQueryResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

interface PaginatedQueryOptions {
  pageSize?: number;
  enabled?: boolean;
}

export function usePaginatedQuery<T>(
  fetcher: (page: number, pageSize: number) => Promise<T[]>,
  options: PaginatedQueryOptions = {}
): PaginatedQueryResult<T> {
  const { pageSize = 20, enabled = true } = options;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const initialized = useRef(false);

  const loadPage = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetcher(pageNum, pageSize);
      setData((prev) => (pageNum === 1 ? items : [...prev, ...items]));
      setHasMore(items.length >= pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [fetcher, pageSize]);

  useEffect(() => {
    if (enabled && !initialized.current) {
      initialized.current = true;
      void void loadPage(1);
    }
  }, [enabled, loadPage]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      void loadPage(nextPage);
    }
  }, [loading, hasMore, page, loadPage]);

  const refresh = useCallback(() => {
    setPage(1);
    setData([]);
    void void loadPage(1);
  }, [loadPage]);

  return { data, loading, error, page, hasMore, loadMore, refresh };
}