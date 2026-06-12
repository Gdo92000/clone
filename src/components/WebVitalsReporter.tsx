import { useEffect } from 'react';
import { onLCP, onCLS, onINP, onTTFB } from 'web-vitals';
import type { Metric } from 'web-vitals';

export function WebVitalsReporter() {
  useEffect(() => {
    const report = (metric: Metric) => {
      console.warn(`[CV] ${metric.name}: ${metric.value} (${metric.rating})`);
    };

    onLCP(report);
    onCLS(report);
    onINP(report);
    onTTFB(report);
  }, []);

  return null;
}
