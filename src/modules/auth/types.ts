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
  | 'billing.view'
  | 'addons.manage'
  | 'companies.block'
  | 'features.manage'
  | 'campaigns.create'
  | 'analytics.view'
  | 'users.invite'
  | 'users.manage'
  | 'orders.manage'
  | 'menu.edit'
  | 'finance.view'
  | 'support.manage'
  | 'kitchen.manage'
  | 'deliveries.manage'
  | 'checkout.use';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subRole?: string;
  companyId?: string;
  branchId?: string;
  avatarUrl: string;
  active: boolean;
}

export interface AuthSession {
  userId: string;
}
