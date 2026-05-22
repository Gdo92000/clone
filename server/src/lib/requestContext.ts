import { AsyncLocalStorage } from 'node:async_hooks'

export interface RequestStore {
  requestId: string
  userId?: string
  tenantId?: string
}

const als = new AsyncLocalStorage<RequestStore>()

export function getRequestStore(): RequestStore | undefined {
  return als.getStore()
}

export function runWithStore(store: RequestStore, fn: () => Promise<void>): Promise<void> {
  return als.run(store, fn)
}
