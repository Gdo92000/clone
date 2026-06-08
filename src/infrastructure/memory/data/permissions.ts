import type { Permission } from 'src/domain/entities/User';

export const mockPermissions: Permission[] = [
  { id: 'perm-1', key: 'settings.manage', name: 'Acesso total', description: '' },
  { id: 'perm-2', key: 'orders.manage', name: 'Gerenciar pedidos', description: '' },
  { id: 'perm-3', key: 'products.manage', name: 'Gerenciar cardápio', description: '' },
  { id: 'perm-4', key: 'reports.view', name: 'Ver relatórios', description: '' },
  { id: 'perm-5', key: 'orders.manage', name: 'Ver pedidos', description: '' },
  { id: 'perm-6', key: 'products.manage', name: 'Atualizar cozinha', description: '' },
  { id: 'perm-7', key: 'settings.manage', name: 'Gerenciar entregas', description: '' },
];
