import { usePersistentState } from './usePersistentState';
import { saasAddons, companySubscriptions } from '../modules/saas/saasData';
import type { CompanySubscription, SaasAddon } from '../modules/saas/types';

function mergeById<T extends { id: string }>(persisted: T[], defaults: T[]) {
  const persistedIds = new Set(persisted.map((item) => item.id));
  return [...persisted, ...defaults.filter((item) => !persistedIds.has(item.id))];
}

function mergeSubscriptions(persisted: CompanySubscription[]) {
  return persisted.map((sub) => {
    const def = companySubscriptions.find((d) => d.companyId === sub.companyId);
    return def ? { ...sub, addonIds: Array.from(new Set([...sub.addonIds, ...def.addonIds])) } : sub;
  });
}

export function useSubscriptions() {
  const [addons, setAddons] = usePersistentState<SaasAddon[]>('saas.addons', saasAddons);
  const [subscriptions, setSubscriptions] = usePersistentState<CompanySubscription[]>('saas.subscriptions', companySubscriptions);
  return { addons: mergeById(addons, saasAddons), setAddons, subscriptions: mergeSubscriptions(subscriptions), setSubscriptions };
}