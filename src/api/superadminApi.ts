import { get, post, put, del } from './httpClient';
import type {
  NotificationDTO,
  AuditEventDTO,
  SupportTicketDTO,
  FeatureFlagDTO,
  GlobalCouponDTO,
  PermissionDTO,
  RolePermissionDTO,
  CapabilityDTO,
  CommissionPlanDTO,
  PlatformMetricsDTO,
  SubscriptionPlanDTO,
  AddonDTO,
  SubscriptionDTO,
  CreateGlobalCouponInput,
} from '../dto/superadminDto';

export const notificationsApi = {
  list: () => get<NotificationDTO[]>('/notifications'),
  create: (data: Record<string, unknown>) => post<NotificationDTO>('/notifications', data),
};

export const auditApi = {
  list: () => get<AuditEventDTO[]>('/audit-events'),
  getById: (id: string) => get<AuditEventDTO>(`/audit-events/${id}`),
};

export const supportApi = {
  list: () => get<SupportTicketDTO[]>('/support-tickets'),
  getById: (id: string) => get<SupportTicketDTO>(`/support-tickets/${id}`),
  update: (id: string, data: Record<string, unknown>) => put<SupportTicketDTO>(`/support-tickets/${id}`, data),
};

export const featureFlagApi = {
  list: () => get<FeatureFlagDTO[]>('/feature-flags'),
  create: (data: Record<string, unknown>) => post<FeatureFlagDTO>('/feature-flags', data),
  delete: (id: string) => del<Record<string, never>>(`/feature-flags/${id}`),
};

export const globalCouponApi = {
  list: () => get<GlobalCouponDTO[]>('/global-coupons'),
  create: (data: CreateGlobalCouponInput) => post<GlobalCouponDTO>('/global-coupons', data),
  update: (id: string, data: Partial<CreateGlobalCouponInput>) => put<GlobalCouponDTO>(`/global-coupons/${id}`, data),
  delete: (id: string) => del<Record<string, never>>(`/global-coupons/${id}`),
};

export const subscriptionApi = {
  getSubscriptions: () => get<SubscriptionDTO[]>('/subscriptions'),
  getPlans: () => get<SubscriptionPlanDTO[]>('/plans'),
  getAddons: () => get<AddonDTO[]>('/addons'),
  updateSubscription: (id: string, data: Record<string, unknown>) => put<Record<string, never>>(`/subscriptions/${id}`, data),
  toggleAddon: (subscriptionId: string, addonId: string) => post<Record<string, never>>('/subscription-addons/toggle', { subscriptionId, addonId }),
};

export const permissionApi = {
  list: () => get<PermissionDTO[]>('/permissions'),
   getByRole: (role: string) => get<RolePermissionDTO[]>(`/permissions/role/${role}`),
  assign: (data: { role: string; permissionId: string }) => post<Record<string, never>>('/permissions/assign', data),
  revoke: (data: { role: string; permissionId: string }) => del<Record<string, never>>(`/permissions/revoke/${data.role}/${data.permissionId}`),
};

export const capabilityApi = {
  list: () => get<CapabilityDTO[]>('/capabilities'),
};

export const commissionPlanApi = {
  list: () => get<CommissionPlanDTO[]>('/commission-plans'),
  update: (id: string, data: Record<string, unknown>) => put<CommissionPlanDTO>(`/commission-plans/${id}`, data),
};

export const reportsApi = {
  getPlatformMetrics: () => get<PlatformMetricsDTO>('/admin/reports/platform-metrics'),
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
