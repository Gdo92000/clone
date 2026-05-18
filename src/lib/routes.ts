export const ROUTES = {
  HOME: '/',

  RESTAURANTS: '/restaurants',
  RESTAURANT_DETAIL: '/restaurant/:restaurantId',
  RESTAURANT_ITEM: '/restaurant/:restaurantId/item/:itemId',
  NEARBY: '/nearby',
  CART: '/cart',
  CHECKOUT: '/checkout',
  TRACKING: '/tracking',
  SEARCH: '/search',
  ORDERS: '/orders',
  PROFILE: '/profile',
  ADDRESSES: '/addresses',
  SESSION: '/session',

  MERCHANT_LOGIN: '/merchant/login',
  MERCHANT: '/merchant',
  MERCHANT_ORDERS: '/merchant/orders',
  MERCHANT_CATALOG: '/merchant/catalog',
  MERCHANT_BRANCHES: '/merchant/branches',
  MERCHANT_TEAM: '/merchant/team',
  MERCHANT_CAMPAIGNS: '/merchant/campaigns',
  MERCHANT_ANALYTICS: '/merchant/analytics',
  MERCHANT_FINANCE: '/merchant/finance',
  MERCHANT_COUPONS: '/merchant/coupons',
  MERCHANT_SUBSCRIPTION: '/merchant/subscription',
  MERCHANT_SETTINGS: '/merchant/settings',
  MERCHANT_HOURS: '/merchant/hours',
  MERCHANT_HOLIDAYS: '/merchant/holidays',

  COURIER: '/courier',
  COURIER_DELIVERIES: '/courier/deliveries',

  SUPERADMIN: '/superadmin',
  SUPERADMIN_PLANS: '/superadmin/plans',
  SUPERADMIN_CAPABILITIES: '/superadmin/capabilities',
  SUPERADMIN_ADDONS: '/superadmin/addons',
  SUPERADMIN_SUBSCRIPTIONS: '/superadmin/subscriptions',
  SUPERADMIN_FEATURES: '/superadmin/features',
  SUPERADMIN_BILLING: '/superadmin/billing',
  SUPERADMIN_USERS: '/superadmin/users',
  SUPERADMIN_AUDIT: '/superadmin/audit',
  SUPERADMIN_COMMISSIONS: '/superadmin/commissions',
  SUPERADMIN_COUPONS: '/superadmin/coupons',
  SUPERADMIN_CATEGORIES: '/superadmin/categories',
  SUPERADMIN_NOTIFICATIONS: '/superadmin/notifications',
  SUPERADMIN_REPORTS: '/superadmin/reports',
  SUPERADMIN_DEMO: '/superadmin/demo',

  ADMIN: '/admin',
  ADMIN_COMPANIES: '/admin/companies',
  ADMIN_COVERAGE: '/admin/coverage',

  ACCESS: '/access',
  NOTIFICATIONS: '/notifications',
  FAVORITES: '/favorites',
  PROMOTIONS: '/promotions',
  SUPPORT: '/support',
  FINANCE: '/finance',
  REVIEWS: '/reviews',
  ONBOARDING: '/onboarding',
  PAYMENT_METHODS: '/payment-methods',
} as const;

export function restaurantDetailHref(restaurantId: string): string {
  return `/restaurant/${encodeURIComponent(restaurantId)}`;
}

export function restaurantItemHref(restaurantId: string, itemId: string): string {
  return `/restaurant/${encodeURIComponent(restaurantId)}/item/${encodeURIComponent(itemId)}`;
}

export function trackingHref(orderId?: string): string {
  return orderId ? `/tracking?order=${encodeURIComponent(orderId)}` : ROUTES.TRACKING;
}

export function restaurantsSearchHref(query: string): string {
  return `/restaurants?search=${encodeURIComponent(query)}`;
}

export function restaurantsCategoryHref(category: string): string {
  return `/restaurants?category=${encodeURIComponent(category)}`;
}

export const ROUTE_AREA: Record<string, string> = {
  '': 'public',
  restaurants: 'public',
  restaurant: 'public',
  cart: 'public',
  checkout: 'public',
  tracking: 'public',
  search: 'public',
  orders: 'public',
  profile: 'public',
  addresses: 'public',
  session: 'public',
  favorites: 'public',
  notifications: 'public',
  promotions: 'public',
  support: 'public',
  finance: 'public',
  onboarding: 'public',
  nearby: 'public',
  'payment-methods': 'public',
  superadmin: 'superadmin',
  admin: 'admin',
  merchant: 'merchant',
  courier: 'courier',
  access: 'experience',
};

export function getRouteArea(prefix: string): string {
  return ROUTE_AREA[prefix] ?? 'public';
}
