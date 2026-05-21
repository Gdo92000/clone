import { authHandlers } from './auth'
import { restaurantHandlers } from './restaurants'
import { merchantHandlers } from './merchant'
import { subscriptionHandlers } from './subscriptions'
import { superadminHandlers } from './superadmin'
import { operationHandlers } from './operations'
import { coverageHandlers } from './coverage'
import { printingHandlers } from './printing'
import { themeHandlers, consumerHandlers, loyaltyHandlers } from './other'
import { proxyHandlers } from './proxy'

export const handlers = [
  ...authHandlers,
  ...restaurantHandlers,
  ...merchantHandlers,
  ...subscriptionHandlers,
  ...superadminHandlers,
  ...operationHandlers,
  ...coverageHandlers,
  ...printingHandlers,
  ...themeHandlers,
  ...consumerHandlers,
  ...loyaltyHandlers,
  ...proxyHandlers,
]
