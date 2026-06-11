import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getToken } from '../services/authService';
import { merchantKeys } from '../api/queryKeys';

interface MerchantSSEOptions {
  branchId: string | null;
  enabled?: boolean;
}

export function useMerchantSSE({ branchId, enabled = true }: MerchantSSEOptions) {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnectRef = useRef(true);
  const branchIdRef = useRef(branchId);
  const enabledRef = useRef(enabled);
  const connectImplRef = useRef<() => void>(() => {});

  useEffect(() => {
    branchIdRef.current = branchId;
  }, [branchId]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    function connectImpl() {
      if (branchIdRef.current == null || !enabledRef.current) return;
      const token = getToken();
      if (!token) return;

      const params = new URLSearchParams({ branch_id: branchIdRef.current });
      const url = `/api/realtime/orders?${params.toString()}`;

      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }

      const es = new EventSource(url, { withCredentials: true });
      esRef.current = es;

      let retryCount = 0;
      const MAX_RETRY = 10;
      const BASE_DELAY = 1000;

      function scheduleRetry() {
        if (!shouldReconnectRef.current) return;
        if (retryCount >= MAX_RETRY) return;
        const delay = Math.min(BASE_DELAY * Math.pow(2, retryCount), 30000);
        retryCount++;
        retryTimerRef.current = setTimeout(connectImplRef.current, delay);
      }

      es.addEventListener('connected', () => {
        setConnected(true);
        retryCount = 0;
      });

      es.addEventListener('order_update', (_event: MessageEvent) => {
        void queryClient.invalidateQueries({ queryKey: merchantKeys.orders });
      });

      es.addEventListener('heartbeat', () => {
      });

      es.onerror = () => {
        setConnected(false);
        es.close();
        esRef.current = null;
        scheduleRetry();
      };
    }

    connectImplRef.current = connectImpl;

    shouldReconnectRef.current = true;
    connectImpl();

    return () => {
      shouldReconnectRef.current = false;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (esRef.current) esRef.current.close();
    };
  }, [branchId, enabled, queryClient]);

  return { connected };
}
