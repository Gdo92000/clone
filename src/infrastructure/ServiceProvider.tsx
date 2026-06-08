/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, createElement, type ReactNode, type FunctionComponent } from 'react';
import { createMemoryServices, type Services } from 'src/infrastructure/composition';

export type DbProvider = 'memory' | 'postgres';

let _services: Services | null = null;

function getServices(provider: DbProvider): Services {
  if (_services) return _services;
  if (provider === 'postgres') {
    throw new Error(
      '[ServiceProvider] VITE_DB_PROVIDER=postgres requires a PostgresJsDatabase instance. ' +
      'Wiring direto de drizzle-orm no frontend ainda nao foi implementado; ' +
      'defina VITE_DB_PROVIDER=memory (ou remova a var) para usar composicao em memoria.',
    );
  }
  _services = createMemoryServices();
  return _services;
}

const ServicesContext = createContext<Services | null>(null);

export interface ServiceProviderProps {
  children: ReactNode;
  provider?: DbProvider;
}

export const ServiceProvider: FunctionComponent<ServiceProviderProps> = ({ children, provider }) => {
  const resolved = provider ?? __DB_PROVIDER__;
  const services = getServices(resolved);
  return createElement(ServicesContext.Provider, { value: services }, children);
};

export function useServices(): Services {
  const ctx = useContext(ServicesContext);
  if (ctx) return ctx;
  return getServices(__DB_PROVIDER__);
}

export { getServices };

export type { Services } from 'src/infrastructure/composition';
