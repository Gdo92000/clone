export type UserRole =
  | 'superadmin'
  | 'admin'
  | 'company_owner'
  | 'branch_manager'
  | 'attendant'
  | 'finance'
  | 'courier'
  | 'customer';

export type PermissionKey =
  | 'plans.manage'
  | 'billing.manage'
  | 'branches.manage'
  | 'products.manage'
  | 'orders.manage'
  | 'users.manage'
  | 'reports.view'
  | 'campaigns.manage'
  | 'coupons.manage'
  | 'coverage.manage'
  | 'audit.view'
  | 'settings.manage'
  | 'support.manage'
  | 'features.manage'
  | 'permissions.manage';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string;
  branchId?: string;
  avatarUrl: string;
  active: boolean;
}

export interface AuthSession {
  userId: string;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface Permission {
  id: string;
  key: PermissionKey;
  name: string;
  description: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  active: boolean;
  createdAt: string;
}
