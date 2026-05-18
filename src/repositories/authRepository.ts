import type { AuthUser } from '../modules/auth/types';
import { authApi } from '../api';
import { authUserListDtoToModel, authUserDtoToModel } from '../mappers/authMapper';

const useMock = __USE_MOCK__;

const mockUsers: AuthUser[] = [
  { id: 'u1', name: 'Admin Global', email: 'admin@ifood.com', role: 'superadmin', companyId: 'company-1', branchId: 'branch-1', avatarUrl: '', active: true },
  { id: 'u2', name: 'Dono da Loja', email: 'dono@loja.com', role: 'company_owner', companyId: 'company-1', branchId: 'branch-1', avatarUrl: '', active: true },
  { id: 'u3', name: 'João Entregador', email: 'joao@entregas.com', role: 'courier', companyId: 'company-1', branchId: 'branch-1', avatarUrl: '', active: true },
];

export async function login(email: string, password: string): Promise<AuthUser> {
  if (useMock) {
    const user = mockUsers.find((u) => u.email === email);
    if (!user) throw new Error('Usuário ou senha inválidos');
    return user;
  }
  const result = await authApi.login(email, password);
  return authUserDtoToModel(result.user);
}

export async function logout(): Promise<void> {
  if (!useMock) await authApi.logout();
}

export async function getUsers(): Promise<AuthUser[]> {
  return useMock ? mockUsers : authApi.getUsers().then(authUserListDtoToModel);
}