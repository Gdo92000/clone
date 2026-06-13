import { useEffect, useState, useCallback } from 'react';
import { getToken } from '../services/authService';
import type { OrderStatusType, OrderStatusStep } from '../types';

interface SSEOrderEvent {
  orderId: string;
  status: OrderStatusType;
  previousStatus?: OrderStatusType;
  timestamp: string;
}

/* ------------------------------------------------------------------ */
/*  Reconnect helpers                                                  */
/* ------------------------------------------------------------------ */

const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;
const RECONNECT_MAX_RETRIES = 20;

/**
 * Exponential backoff with ±50% jitter so multiple clients don't
 * reconnect simultaneously after a server restart.
 */
function calculateBackoff(attempt: number): number {
  const exponential = Math.min(
    RECONNECT_BASE_MS * 2 ** attempt,
    RECONNECT_MAX_MS,
  );
  const jitter = exponential * (0.5 + Math.random());
  return Math.round(jitter);
}

/* ------------------------------------------------------------------ */
/*  useSSEOrderTracking                                                */
/* ------------------------------------------------------------------ */

export function useSSEOrderTracking({ steps, estimatedTime, branchId }: {
  steps: OrderStatusStep[];
  estimatedTime?: string;
  branchId?: string;
}) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatusType>(steps[0]?.status ?? 'confirmed');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [connected, setConnected] = useState(false);

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

    let retryCount = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let currentEs: EventSource | null = null;
    let isCancelled = false;

    function connect() {
      if (isCancelled) return;

      const es = new EventSource(url, { withCredentials: true });
      currentEs = es;

      es.addEventListener('connected', () => {
        setConnected(true);
        retryCount = 0;
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
        /* keep-alive — server sends every 25 s */
      });

      es.onerror = () => {
        setConnected(false);
        es.close();
        currentEs = null;

        if (isCancelled) return;

        if (retryCount < RECONNECT_MAX_RETRIES) {
          const delay = calculateBackoff(retryCount);
          retryCount++;
          reconnectTimer = setTimeout(connect, delay);
        }
      };
    }

    connect();

    return () => {
      isCancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      currentEs?.close();
      currentEs = null;
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

/* ------------------------------------------------------------------ */
/*  useSSEStatus                                                       */
/* ------------------------------------------------------------------ */

export function useSSEStatus() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const url = '/api/realtime/orders';

    let retryCount = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let currentEs: EventSource | null = null;
    let isCancelled = false;

    function connect() {
      if (isCancelled) return;

      const es = new EventSource(url, { withCredentials: true });
      currentEs = es;

      es.addEventListener('connected', () => {
        setConnected(true);
        retryCount = 0;
      });

      es.addEventListener('heartbeat', () => {
        /* keep-alive */
      });

      es.onerror = () => {
        setConnected(false);
        es.close();
        currentEs = null;

        if (isCancelled) return;

        if (retryCount < RECONNECT_MAX_RETRIES) {
          const delay = calculateBackoff(retryCount);
          retryCount++;
          reconnectTimer = setTimeout(connect, delay);
        }
      };
    }

    connect();

    return () => {
      isCancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      currentEs?.close();
      currentEs = null;
      setConnected(false);
    };
  }, []);

  return { connected };
}

export default useSSEOrderTracking;
