import { useEffect, useRef, useState, useCallback } from 'react';
import { getToken } from '../services/authService';
import type { OrderStatusType, OrderStatusStep } from '../types';

interface SSEOrderEvent {
  orderId: string;
  status: OrderStatusType;
  previousStatus?: OrderStatusType;
  timestamp: string;
}

export function useSSEOrderTracking({ steps, estimatedTime, branchId }: {
  steps: OrderStatusStep[];
  estimatedTime?: string;
  branchId?: string;
}) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatusType>(steps[0]?.status ?? 'confirmed');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);

  const handleOrderEvent = useCallback((event: SSEOrderEvent) => {
    const idx = steps.findIndex((s) => s.status === event.status);
    if (idx !== -1 && idx > currentStepIndex) {
      setCurrentStepIndex(idx);
      setCurrentStatus(event.status);
    }
  }, [steps, currentStepIndex]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const params = new URLSearchParams();
    if (branchId) params.set('branch_id', branchId);

    const url = `/api/realtime/orders${params.toString() ? `?${params.toString()}` : ''}`;
    const es = new EventSource(url, { withCredentials: true });

    es.addEventListener('connected', () => {
      setConnected(true);
      retryCountRef.current = 0;
    });

    es.addEventListener('order_update', (event: MessageEvent) => {
      try {
        const raw = event.data as string;
        const data = JSON.parse(raw) as SSEOrderEvent;
        handleOrderEvent(data);
      } catch {
        /* ignore malformed events */
      }
    });

    es.addEventListener('heartbeat', () => {
      /* keep-alive */
    });

    es.onerror = () => {
      setConnected(false);
      es.close();
    };

    eventSourceRef.current = es;

    return () => {
      es.close();
      setConnected(false);
    };
  }, [branchId, handleOrderEvent]);

  return {
    currentStatus,
    currentStepIndex,
    steps,
    estimatedTime,
    connected,
  };
}

export function useSSEStatus() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const es = new EventSource('/api/realtime/orders', { withCredentials: true });

    es.addEventListener('connected', () => { setConnected(true); });
    es.addEventListener('heartbeat', () => { /* keep-alive */ });
    es.onerror = () => {
      setConnected(false);
      es.close();
    };

    return () => { es.close(); setConnected(false); };
  }, []);

  return { connected };
}
