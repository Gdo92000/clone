import type { GlobalCouponDTO, CreateGlobalCouponInput, NotificationDTO, AuditEventDTO, CommissionPlanDTO, PlatformMetricsDTO, PermissionDTO, RolePermissionDTO } from '../../dto/superadminDto';

export class SuperadminService {
  constructor(
    private readonly globalCouponApi: { list: () => Promise<GlobalCouponDTO[]>; create: (data: CreateGlobalCouponInput) => Promise<GlobalCouponDTO>; update: (id: string, data: Partial<CreateGlobalCouponInput>) => Promise<GlobalCouponDTO>; delete: (id: string) => Promise<Record<string, never>> },
    private readonly notificationsApi: { list: () => Promise<NotificationDTO[]> },
    private readonly auditApi: { list: () => Promise<AuditEventDTO[]> },
    private readonly merchantApi: { getCompanies: () => Promise<unknown[]> },
    private readonly superadminSubscriptionApi: { getSubscriptions: () => Promise<unknown[]>; getAddons: () => Promise<unknown[]>; getPlans: () => Promise<unknown[]>; updateSubscription: (id: string, data: Record<string, unknown>) => Promise<Record<string, never>>; toggleAddon: (subscriptionId: string, addonId: string) => Promise<Record<string, never>> },
    private readonly commissionPlanApi: { list: () => Promise<CommissionPlanDTO[]>; update: (id: string, data: Record<string, unknown>) => Promise<CommissionPlanDTO> },
    private readonly reportsApi: { getPlatformMetrics: () => Promise<PlatformMetricsDTO> },
    private readonly superadminApi: { permissionApi: { list: () => Promise<PermissionDTO[]>; getByRole: (role: string) => Promise<RolePermissionDTO[]>; assign: (data: { role: string; permissionId: string }) => Promise<Record<string, never>>; revoke: (data: { role: string; permissionId: string }) => Promise<Record<string, never>> } }
  ) {}

  async listGlobalCoupons(): Promise<GlobalCouponDTO[]> {
    return this.globalCouponApi.list();
  }

  async createGlobalCoupon(data: CreateGlobalCouponInput): Promise<GlobalCouponDTO> {
    return this.globalCouponApi.create(data);
  }

  async updateGlobalCoupon(id: string, data: Partial<CreateGlobalCouponInput>): Promise<GlobalCouponDTO> {
    return this.globalCouponApi.update(id, data);
  }

  async deleteGlobalCoupon(id: string): Promise<void> {
    await this.globalCouponApi.delete(id);
  }

  async listNotifications(): Promise<NotificationDTO[]> {
    return this.notificationsApi.list();
  }

  async listAuditEvents(): Promise<AuditEventDTO[]> {
    return this.auditApi.list();
  }

  async getPlatformMetrics(): Promise<{ totalCompanies: number; totalSubscriptions: number }> {
    const [companies, subscriptions] = await Promise.all([
      this.merchantApi.getCompanies().catch((err: unknown) => {
        console.error('Superadmin', 'Failed to fetch companies', err);
        return [] as unknown[];
      }),
      this.superadminSubscriptionApi.getSubscriptions().catch((err: unknown) => {
        console.error('Superadmin', 'Failed to fetch subscriptions', err);
        return [] as unknown[];
      }),
    ]);
    return {
      totalCompanies: Array.isArray(companies) ? companies.length : 0,
      totalSubscriptions: Array.isArray(subscriptions) ? subscriptions.length : 0,
    };
  }

  async listCommissionPlans(): Promise<CommissionPlanDTO[]> {
    return this.commissionPlanApi.list();
  }

  async updateCommissionPlan(id: string, data: Record<string, unknown>): Promise<CommissionPlanDTO> {
    return this.commissionPlanApi.update(id, data);
  }

  async getPlatformReports(): Promise<PlatformMetricsDTO> {
    return this.reportsApi.getPlatformMetrics();
  }

  async getSaasSubscriptions(): Promise<unknown[]> {
    return this.superadminSubscriptionApi.getSubscriptions();
  }

  async getSaasAddonsList(): Promise<unknown[]> {
    return this.superadminSubscriptionApi.getAddons();
  }

  async getSaasPlansList(): Promise<unknown[]> {
    return this.superadminSubscriptionApi.getPlans();
  }

  async updateSubscriptionPlan(companyId: string, planId: string): Promise<void> {
    await this.superadminSubscriptionApi.updateSubscription(companyId, { plan_id: planId });
  }

  async updateSubscriptionStatus(companyId: string, billingStatus: string): Promise<void> {
    await this.superadminSubscriptionApi.updateSubscription(companyId, { billing_status: billingStatus });
  }

  async toggleSubscriptionAddon(subscriptionId: string, addonId: string): Promise<void> {
    await this.superadminSubscriptionApi.toggleAddon(subscriptionId, addonId);
  }

  async toggleAddonForCurrentSubscription(addonId: string): Promise<void> {
    await this.superadminSubscriptionApi.toggleAddon('current', addonId);
  }

  async getAllPermissions(): Promise<PermissionDTO[]> {
    return this.superadminApi.permissionApi.list();
  }

  async getRolePermissions(role: string): Promise<RolePermissionDTO[]> {
    return this.superadminApi.permissionApi.getByRole(role);
  }

  async assignPermission(data: { role: string; permissionId: string }): Promise<void> {
    await this.superadminApi.permissionApi.assign(data);
  }

  async revokePermission(data: { role: string; permissionId: string }): Promise<void> {
    await this.superadminApi.permissionApi.revoke(data);
  }
}
