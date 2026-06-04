export const merchantKeys = {
  all: ['merchant'] as const,
  companies: ['merchant', 'companies'] as const,
  branches: ['merchant', 'branches'] as const,
  branchesByCompany: (companyId: string) => ['merchant', 'branches', companyId] as const,
  menuItems: ['merchant', 'menuItems'] as const,
  menuItemsByBranch: (branchId: string) => ['merchant', 'menuItems', branchId] as const,
  orders: ['merchant', 'orders'] as const,
  ordersByBranch: (branchId: string) => ['merchant', 'orders', branchId] as const,
  coupons: ['merchant', 'coupons'] as const,
  couponsByBranch: (branchId: string) => ['merchant', 'coupons', branchId] as const,
  campaigns: ['merchant', 'campaigns'] as const,
  printerConfig: (branchId: string) => ['merchant', 'printer-config', branchId] as const,
  printHistory: (branchId: string) => ['merchant', 'print-history', branchId] as const,
  branchSettings: (branchId: string) => ['merchant', 'branch-settings', branchId] as const,
  loyaltySettings: (branchId: string) => ['merchant', 'loyalty-settings', branchId] as const,
  loyaltyRewards: (branchId: string) => ['merchant', 'loyalty-rewards', branchId] as const,
} as const;

export const operationsKeys = {
  all: ['operations'] as const,
  status: (branchId: string) => ['operations', 'status', branchId] as const,
  todayPeriods: (branchId: string) => ['operations', 'today-periods', branchId] as const,
  hours: (branchId: string) => ['operations', 'hours', branchId] as const,
  holidayOverrides: (branchId: string) => ['operations', 'holiday-overrides', branchId] as const,
  specialDates: (branchId: string) => ['operations', 'special-dates', branchId] as const,
  holidays: ['operations', 'holidays'] as const,
} as const;

export const superadminKeys = {
  all: ['superadmin'] as const,
  globalCoupons: ['superadmin', 'global-coupons'] as const,
  notifications: ['superadmin', 'notifications'] as const,
  auditEvents: ['superadmin', 'audit-events'] as const,
  platformMetrics: ['superadmin', 'platform-metrics'] as const,
  commissionPlans: ['superadmin', 'commission-plans'] as const,
  platformReports: ['superadmin', 'platform-reports'] as const,
  permissionsAll: ['superadmin', 'permissions-all'] as const,
  permissionsByRole: (role: string) => ['superadmin', 'permissions-role', role] as const,
} as const;

export const saasKeys = {
  all: ['saas'] as const,
  addons: ['saas', 'addons'] as const,
  subscriptions: ['saas', 'subscriptions'] as const,
  plans: ['saas', 'plans'] as const,
  invoices: ['saas', 'invoices'] as const,
  userAddons: ['saas', 'user-addons'] as const,
} as const;

export const restaurantKeys = {
  all: ['restaurants'] as const,
  list: ['restaurants'] as const,
  detail: (id: string) => ['restaurant', id] as const,
  menuItems: (restaurantId: string) => ['menuItems', restaurantId] as const,
  menuItem: (id: string) => ['menuItem', id] as const,
  categories: ['categories'] as const,
} as const;

export const coverageKeys = {
  all: ['coverage'] as const,
  cities: ['coverage', 'cities'] as const,
} as const;

export const courierKeys = {
  all: ['courier'] as const,
  deliveries: ['courier', 'deliveries'] as const,
} as const;

export const adminKeys = {
  all: ['admin'] as const,
  companies: ['admin', 'companies'] as const,
  metrics: ['admin', 'metrics'] as const,
} as const;

export const authKeys = {
  all: ['auth'] as const,
  users: ['auth', 'users'] as const,
  session: ['auth', 'session'] as const,
} as const;

export const consumerKeys = {
  all: ['consumer'] as const,
  loyalty: (branchId: string) => ['consumer', 'loyalty', branchId] as const,
  orders: ['consumer', 'my-orders'] as const,
  notifications: ['consumer', 'my-notifications'] as const,
  tickets: ['consumer', 'my-tickets'] as const,
  reviews: ['consumer', 'reviews'] as const,
  addresses: ['consumer', 'addresses'] as const,
} as const;

export const themeKeys = {
  all: ['theme'] as const,
  myTheme: (area: string) => ['theme', 'my-theme', area] as const,
} as const;
