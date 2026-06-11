import type { Registry, Repositories, RuntimeCapabilities } from './registry';
import { EntityStore, BaseMemoryRepository } from './repositories/base-memory';
import type { Filter } from '../ports/repository';

/**
 * memoryRepoFactory — fábrica genérica de repositórios memória.
 *
 * Usa uma store vazia e BaseMemoryRepository padrão.  Campos específicos
 * (como restaurantes) devem ser populados por seed posterior.
 */
function memoryRepo<T extends Record<string, unknown> = Record<string, unknown>>(
  store: EntityStore,
): BaseMemoryRepository<T, Filter<T>> {
  return new BaseMemoryRepository<T, Filter<T>>(store);
}

/**
 * store factory — cacheia EntityStore por namespace para reuso entre
 * chamadas de createMemoryRegistry dentro do mesmo processo.
 */
const storeCache = new Map<string, EntityStore>();
function getStore(namespace: string): EntityStore {
  const cached = storeCache.get(namespace);
  if (cached) return cached;
  const store = new EntityStore(namespace);
  storeCache.set(namespace, store);
  return store;
}

/**
 * createMemoryRegistry — monta Registry completo em modo memória.
 *
 * Cada repositório usa uma EntityStore própria, não compartilhada entre
 * instâncias de registry (a menos que venham do mesmo processo).
 *
 * @param capabilities  RuntimeCapabilities do provider memory.
 */
export function createMemoryRegistry(
  capabilities: RuntimeCapabilities,
): Registry {
  const health = {
    check: () => Promise.resolve({ ok: true }),
  };

const transactions = {
  start: () => Promise.resolve({
    getTransaction: () => Promise.resolve(undefined),
    commit: () => Promise.resolve(),
    rollback: () => Promise.resolve(),
  }),
};

  const repos: Repositories = {
    restaurants:      memoryRepo(getStore('restaurants')),
    categories:       memoryRepo(getStore('categories')),
    menuItems:        memoryRepo(getStore('menuItems')),
    additives:        memoryRepo(getStore('additives')),
    companies:        memoryRepo(getStore('companies')),
    branches:         memoryRepo(getStore('branches')),
    merchantOrders:   memoryRepo(getStore('merchantOrders')),
    orders:           memoryRepo(getStore('orders')),
    users:            memoryRepo(getStore('users')),
    subscriptions:    memoryRepo(getStore('subscriptions')),
    invoices:         memoryRepo(getStore('invoices')),
    addons:           memoryRepo(getStore('addons')),
    plans:            memoryRepo(getStore('plans')),
    capabilities:     memoryRepo(getStore('capabilities')),
    featureFlags:     memoryRepo(getStore('featureFlags')),
    notifications:    memoryRepo(getStore('notifications')),
    auditEvents:      memoryRepo(getStore('auditEvents')),
    supportTickets:   memoryRepo(getStore('supportTickets')),
    userNotifications: memoryRepo(getStore('userNotifications')),
    branchSettings:   memoryRepo(getStore('branchSettings')),
    commissionPlans:  memoryRepo(getStore('commissionPlans')),
    campaigns:        memoryRepo(getStore('campaigns')),
    coupons:          memoryRepo(getStore('globalCoupons')),
    loyaltySettings:  memoryRepo(getStore('loyaltySettings')),
    userLoyaltyPoints: memoryRepo(getStore('userLoyaltyPoints')),
    loyaltyTransactions: memoryRepo(getStore('loyaltyRewards')),
    coverageCities:   memoryRepo(getStore('coverageCities')),
    consumerReviews:  memoryRepo(getStore('reviews')),
    consumerOrders:   memoryRepo(getStore('orders')),
    permissions:      memoryRepo(getStore('permissions')),
    printingJobs:     memoryRepo(getStore('printJobs')),
    consumerSupport:  memoryRepo(getStore('supportTickets')),
    authSessions:     memoryRepo(getStore('authSessions')),
    passwordResets:   memoryRepo(getStore('passwordResets')),
    businessHours:    memoryRepo(getStore('businessHours')),
    businessHourPeriods: memoryRepo(getStore('businessHourPeriods')),
    holidayRules:     memoryRepo(getStore('holidayRules')),
    holidayOverrides: memoryRepo(getStore('holidayOverrides')),
    specialDates:     memoryRepo(getStore('specialDates')),
    audits:           memoryRepo(getStore('auditEvents')),
  };

  return {
    provider: 'memory',
    capabilities,
    health,
    repos: repos,
    transactions,
  };
}

/**
 * clearAllMemoryStores — reseta todas as stores entre testes.
 * Usado em afterEach/afterAll de suítes de teste.
 */
export function clearAllMemoryStores(): void {
  storeCache.clear();
}

/**
 * resetMemoryStore — reseta uma store específica.
 */
export function resetMemoryStore(namespace: string): void {
  storeCache.delete(namespace);
}
