import type { PermissionKey, UserRole } from './types';

export const roleLabels: Record<UserRole, string> = {
  superadmin: 'Superadmin',
  admin: 'Admin',
  company_owner: 'Dono da empresa',
  branch_manager: 'Gerente de filial',
  attendant: 'Atendente',
  finance: 'Financeiro',
  courier: 'Entregador',
  customer: 'Cliente',
};

export const rolePermissions: Record<UserRole, PermissionKey[]> = {
  superadmin: [
    'plans.manage',
    'billing.manage',
    'billing.view',
    'addons.manage',
    'companies.block',
    'features.manage',
    'campaigns.create',
    'analytics.view',
    'users.invite',
    'users.manage',
    'orders.manage',
    'menu.edit',
    'finance.view',
    'support.manage',
    'kitchen.manage',
    'deliveries.manage',
    'checkout.use',
  ],
  admin: ['companies.block', 'orders.manage', 'deliveries.manage', 'analytics.view'],
  company_owner: ['billing.manage', 'billing.view', 'addons.manage', 'campaigns.create', 'analytics.view', 'users.invite', 'users.manage', 'orders.manage', 'menu.edit', 'finance.view'],
  branch_manager: ['campaigns.create', 'analytics.view', 'users.invite', 'orders.manage', 'menu.edit', 'kitchen.manage'],
  attendant: ['orders.manage'],
  finance: ['billing.view', 'analytics.view', 'finance.view'],
  courier: ['deliveries.manage'],
  customer: ['checkout.use'],
};


