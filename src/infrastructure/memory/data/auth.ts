import type { AuthUser, AuthSession } from 'src/domain/entities/User';

export const mockUsers: AuthUser[] = [
  { id: 'user-1', name: 'Admin Master', email: 'admin@admin.com', role: 'superadmin', avatarUrl: '', active: true },
  { id: 'user-2', name: 'João Restaurante', email: 'joao@burgerhouse.com', role: 'company_owner', companyId: 'comp-1', branchId: 'branch-1', avatarUrl: '', active: true },
  { id: 'user-3', name: 'Maria Cozinha', email: 'maria@sakura.com', role: 'branch_manager', companyId: 'comp-2', branchId: 'branch-2', avatarUrl: '', active: true },
  { id: 'user-4', name: 'Carlos Entregas', email: 'carlos@delivery.com', role: 'courier', branchId: 'branch-1', avatarUrl: '', active: true },
  { id: 'user-5', name: 'Ana Cliente', email: 'ana@email.com', role: 'customer', avatarUrl: '', active: true },
  { id: 'user-6', name: 'Admin Municipal', email: 'admin@cidade.com', role: 'admin', avatarUrl: '', active: true },
  { id: 'user-7', name: 'Financeiro', email: 'financeiro@burgerhouse.com', role: 'finance', companyId: 'comp-1', branchId: 'branch-1', avatarUrl: '', active: true },
  { id: 'user-8', name: 'Atendente', email: 'atendente@burgerhouse.com', role: 'attendant', companyId: 'comp-1', branchId: 'branch-1', avatarUrl: '', active: true },
  { id: 'user-9', name: 'Pedro Bahia Lanches', email: 'pedro@bahialanches.com', role: 'company_owner', companyId: 'comp-3', branchId: 'branch-3', avatarUrl: '', active: true },
  { id: 'user-10', name: 'Carlos Cliente', email: 'carlos@cliente.com', role: 'customer', avatarUrl: '', active: true },
];

export const mockSessions: AuthSession[] = [
  { userId: 'user-1', token: 'mock-jwt-token-superadmin', refreshToken: 'mock-refresh-token', expiresIn: 86400 },
];
