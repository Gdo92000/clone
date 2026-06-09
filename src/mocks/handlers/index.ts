import { authHandlers } from './auth'
import { restaurantHandlers } from './restaurants'
import { merchantHandlers } from './merchant'
import { subscriptionHandlers } from './subscriptions'
import { superadminHandlers } from './superadmin'
import { operationHandlers } from './operations'
import { printingHandlers } from './printing'
import { themeHandlers, consumerHandlers, loyaltyHandlers } from './other'
import { customerHandlers } from './customer'
import { cityCoverageHandlers } from './cities'
import { analyticsHandlers } from './analytics'

export const handlers = [
  ...authHandlers,
  ...restaurantHandlers,
  ...merchantHandlers,
  ...subscriptionHandlers,
  ...superadminHandlers,
  ...operationHandlers,
  ...printingHandlers,
  ...themeHandlers,
  ...consumerHandlers,
  ...loyaltyHandlers,
  ...customerHandlers,
  ...cityCoverageHandlers,
  ...analyticsHandlers,
]
