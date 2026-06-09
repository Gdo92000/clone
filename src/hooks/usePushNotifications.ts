import { useEffect, useRef } from 'react';
import { registerServiceWorker, getVapidPublicKey, subscribeToPush, sendSubscriptionToServer } from '../services/push';
import { logger } from '../lib/logger';

export function usePushNotifications(enabled: boolean): void {
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!enabled || subscribedRef.current) return;
    subscribedRef.current = true;

    void (async () => {
      try {
        const registration = await registerServiceWorker();
        if (!registration) {
          logger.info('Push', 'Not supported in this browser');
          return;
        }

        const existingSub = await registration.pushManager.getSubscription();

        if (existingSub) {
          await sendSubscriptionToServer(existingSub);
          return;
        }

        const vapidKey = await getVapidPublicKey();
        const subscription = await subscribeToPush(registration, vapidKey);
        if (!subscription) return;

        await sendSubscriptionToServer(subscription);
        logger.info('Push', 'Subscription active');
      } catch (err) {
        logger.warn('Push', 'Subscription failed', { error: String(err) });
      }
    })();
  }, [enabled]);
}
