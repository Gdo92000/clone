import { get, post, put, del } from './httpClient';

export const notificationsApi = {
  list: () => get<any[]>('/notifications'),
  create: (data: any) => post<any>('/notifications', data),
};

export const auditApi = {
  list: () => get<any[]>('/audit-events'),
  getById: (id: string) => get<any>(`/audit-events/${id}`),
};

export const supportApi = {
  list: () => get<any[]>('/support-tickets'),
  getById: (id: string) => get<any>(`/support-tickets/${id}`),
  update: (id: string, data: any) => put<any>(`/support-tickets/${id}`, data),
};

export const featureFlagApi = {
  list: () => get<any[]>('/feature-flags'),
  create: (data: any) => post<any>('/feature-flags', data),
  delete: (id: string) => del<void>(`/feature-flags/${id}`),
};

export const globalCouponApi = {
  list: () => get<any[]>('/global-coupons'),
  create: (data: any) => post<any>('/global-coupons', data),
  update: (id: string, data: any) => put<any>(`/global-coupons/${id}`, data),
  delete: (id: string) => del<void>(`/global-coupons/${id}`),
};

export const subscriptionApi = {
  getSubscriptions: () => get<any[]>('/subscriptions'),
  getPlans: () => get<any[]>('/plans'),
  getAddons: () => get<any[]>('/addons'),
  updateSubscription: (id: string, data: any) => put<void>(`/subscriptions/${id}`, data),
};

export const permissionApi = {
  list: () => get<any[]>('/permissions'),
  getByRole: (role: string) => get<any[]>(`/permissions/role/${role}`),
  assign: (data: { role: string; permissionId: string }) => post<void>('/permissions/assign', data),
  revoke: (data: { role: string; permissionId: string }) => del<void>(`/permissions/revoke/${data.role}/${data.permissionId}`),
};

export const capabilityApi = {
  list: () => get<any[]>('/capabilities'),
};

export const commissionPlanApi = {
  list: () => get<any[]>('/commission-plans'),
  update: (id: string, data: any) => put<any>(`/commission-plans/${id}`, data),
};

export const reportsApi = {
  getPlatformMetrics: () => get<any>('/admin/reports/platform-metrics'),
};

export const superadminApi = {
  notificationsApi,
  auditApi,
  supportApi,
  featureFlagApi,
  globalCouponApi,
  subscriptionApi,
  permissionApi,
  capabilityApi,
  commissionPlanApi,
  reportsApi,
};
