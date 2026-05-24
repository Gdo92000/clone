import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { RepositoryPort, HealthPort, Filter } from '../ports/repository';
import type { TransactionPort } from '../ports/transaction';
import type { DbProvider, RuntimeCapabilities } from './provider';
import { PostgresRepository } from './repositories/base-postgres';
import * as schemaModule from './schema';

// Re-export schema elements for registry type inference
export { tables as schemaTables, Tables } from './schema';

/** Alias local para reduzir verbosidade manual. */
type TPostgresRow<T extends ReturnType<typeof drizzle>['_']['allTables'][string]>
  = T['_']['columns'][string]['_']['rowType'];

/**
 * Registry — contêiner centralizado de dependências do backend.
 *
 * Rotas e serviços recebem portas (interfaces) via Registry, nunca instâncias
 * concretas diretamente. Isso permite trocar o provider (postgres ↔ memory)
 * sem tocar uma linha de rota.
 */
export interface Registry {
  provider: DbProvider;
  capabilities: RuntimeCapabilities;
  health: HealthPort;
  repos: Repositories;
  transactions: Transactions;
}

/**
 * Repositórios concretos — uma entrada por tabela/agregado.
 * Cada entrada implementa RepositoryPort.
 */
export interface Repositories {
  restaurants:      RepositoryPort<TablesSelect['restaurants']>;
  categories:       RepositoryPort<TTablesSelect['categories']>;
  menuItems:        RepositoryPort<TTablesSelect['menuItems']>;
  additives:        RepositoryPort<TTablesSelect['additives']>;
  companies:        RepositoryPort<TTablesSelect['companies']>;
  branches:         RepositoryPort<TTablesSelect['branches']>;
  merchantOrders:   RepositoryPort<TTablesSelect['merchantOrders']>;
  orders:           RepositoryPort<TTablesSelect['orders']>;
  users:            RepositoryPort<TTablesSelect['users']>;
  subscriptions:    RepositoryPort<TTablesSelect['subscriptions']>;
  invoices:         RepositoryPort<TTablesSelect['invoices']>;
  addons:           RepositoryPort<TTablesSelect['addons']>;
  plans:            RepositoryPort<TTablesSelect['plans']>;
  capabilities:     RepositoryPort<TTablesSelect['capabilities']>;
  featureFlags:     RepositoryPort<TTablesSelect['feature_flags']>;
  notifications:    RepositoryPort<TTablesSelect['notifications']>;
  auditEvents:      RepositoryPort<TTablesSelect['auditEvents']>;
  supportTickets:   RepositoryPort<TTablesSelect['supportTickets']>;
  userNotifications: RepositoryPort<TTablesSelect['userNotifications']>;
  branchSettings:   RepositoryPort<TTablesSelect['branchSettings']>;
  commissionPlans:  RepositoryPort<TTablesSelect['commissionPlans']>;
  campaigns:        RepositoryPort<TTablesSelect['campaigns']>;
  coupons:          RepositoryPort<TTablesSelect['globalCoupons']>;
  loyaltySettings:  RepositoryPort<TTablesSelect['loyaltySettings']>;
  userLoyaltyPoints: RepositoryPort<TTablesSelect['userLoyaltyPoints']>;
  loyaltyTransactions: RepositoryPort<TTablesSelect['loyaltyRewards']>;
  coverageCities:   RepositoryPort<TTablesSelect['coverageCities']>;
  consumerReviews:  RepositoryPort<TTablesSelect['reviews']>;
  consumerOrders:   RepositoryPort<TTablesSelect['orders']>;
  permissions:      RepositoryPort<TTablesSelect['permissions']>;
  printingJobs:     RepositoryPort<TTablesSelect['printJobs']>;
  consumerSupport:  RepositoryPort<TTablesSelect['supportTickets']>;
  authSessions:     RepositoryPort<TTablesSelect['authSessions']>;
  passwordResets:   RepositoryPort<TTablesSelect['passwordResets']>;
  businessHours:    RepositoryPort<TTablesSelect['businessHours']>;
  businessHourPeriods: RepositoryPort<TTablesSelect['businessHourPeriods']>;
  holidayRules:     RepositoryPort<TTablesSelect['holidayRules']>;
  holidayOverrides: RepositoryPort<TTablesSelect['holidayOverrides']>;
  specialDates:     RepositoryPort<TTablesSelect['specialDates']>;
  audits:           RepositoryPort<TTablesSelect['auditEvents']>;
}

/**
 * Adaptadores transacionais por provider.
 */
export interface Transactions {
  start: () => Promise<TransactionPort>;
}

/**
 * Type helper — inferência unificada das tabelas do drizzle schema.
 */
type Tables = typeof schemaModule.tables;
type TablesSelect = {
  [K in keyof Tables]: Tables[K] extends { $inferSelect: infer R } ? R : never;
};

// Alias curto para uso em Repositories
type TTablesSelect = TablesSelect;

/**
 * Export DbProvider and RuntimeCapabilities from provider module.
 */
export { DbProvider } from './provider';
export type { RuntimeCapabilities } from './provider';

/**
 * createRegistry — monta o Registry completo a partir da drizzle db.
 *
 * Chamado por createDatabase() no bootstrapping.  Cada propriedade de
 * `repos` é uma instância PostgresRepository amarrada à sua tabela drizzle.
 *
 * @param db          Instância drizzle já inicializada.
 * @param schema      Objeto `tables` exportado do drizzle schema.
 * @param health      Implementação concreta de HealthPort.
 * @param tx          Adaptador transacional concreto (provider ativo).
 * @param provider    Provider de banco selecionado.
 * @returns Registry completo e pronto para uso.
 */
export function createRegistry(
  db: ReturnType<typeof drizzle>,
  schema: Tables,
  health: HealthPort,
  tx: Transactions,
  provider: DbProvider,
): Registry {
  const repos = {
    restaurants:      new PostgresRepository(db, schema.restaurants),
    categories:       new PostgresRepository(db, schema.categories),
    menuItems:        new PostgresRepository(db, schema.menuItems),
    additives:        new PostgresRepository(db, schema.additives),
    companies:        new PostgresRepository(db, schema.companies),
    branches:         new PostgresRepository(db, schema.branches),
    merchantOrders:   new PostgresRepository(db, schema.merchantOrders),
    orders:           new PostgresRepository(db, schema.orders),
    users:            new PostgresRepository(db, schema.users),
    subscriptions:    new PostgresRepository(db, schema.subscriptions),
    invoices:         new PostgresRepository(db, schema.invoices),
    addons:           new PostgresRepository(db, schema.addons),
    plans:            new PostgresRepository(db, schema.plans),
    capabilities:     new PostgresRepository(db, schema.capabilities),
    featureFlags:     new PostgresRepository(db, schema.feature_flags),
    notifications:    new PostgresRepository(db, schema.notifications),
    auditEvents:      new PostgresRepository(db, schema.auditEvents),
    supportTickets:   new PostgresRepository(db, schema.supportTickets),
    userNotifications: new PostgresRepository(db, schema.userNotifications),
    branchSettings:   new PostgresRepository(db, schema.branchSettings),
    commissionPlans:  new PostgresRepository(db, schema.commissionPlans),
    campaigns:        new PostgresRepository(db, schema.campaigns),
    coupons:          new PostgresRepository(db, schema.globalCoupons),
    loyaltySettings:  new PostgresRepository(db, schema.loyaltySettings),
    userLoyaltyPoints: new PostgresRepository(db, schema.userLoyaltyPoints),
    loyaltyTransactions: new PostgresRepository(db, schema.loyaltyRewards),
    coverageCities:   new PostgresRepository(db, schema.coverageCities),
    consumerReviews:  new PostgresRepository(db, schema.reviews),
    consumerOrders:   new PostgresRepository(db, schema.orders),
    permissions:      new PostgresRepository(db, schema.permissions),
    printingJobs:     new PostgresRepository(db, schema.printJobs),
    consumerSupport:  new PostgresRepository(db, schema.supportTickets),
    authSessions:     new PostgresRepository(db, schema.authSessions),
    passwordResets:   new PostgresRepository(db, schema.passwordResets),
    businessHours:    new PostgresRepository(db, schema.businessHours),
    businessHourPeriods: new PostgresRepository(db, schema.businessHourPeriods),
    holidayRules:     new PostgresRepository(db, schema.holidayRules),
    holidayOverrides: new PostgresRepository(db, schema.holidayOverrides),
    specialDates:     new PostgresRepository(db, schema.specialDates),
    audits:           new PostgresRepository(db, schema.auditEvents),
  } as Repositories;

  return {
    provider,
    capabilities: {} as RuntimeCapabilities,
    health,
    repos,
    transactions: tx,
  };
}
