import { useState, useEffect, useRef } from 'react';
import type { OrderStatusType, OrderStatusStep } from '../types';

interface UseOrderTrackingOptions {
  steps: OrderStatusStep[];
  estimatedTime?: string;
  pollingInterval?: number;
}

export function useOrderTracking({ steps, estimatedTime, pollingInterval = 60000 }: UseOrderTrackingOptions) {
  const initialStatus = steps[0]?.status ?? 'confirmed';
  const [currentStatus, setCurrentStatus] = useState<OrderStatusType>(initialStatus);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = prev + 1;
        if (next < steps.length) {
          setCurrentStatus(steps[next]?.status ?? 'confirmed');
          return next;
        }
        return prev;
      });
    }, pollingInterval);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [steps, pollingInterval]);

  return { currentStatus, currentStepIndex, steps, estimatedTime };
}