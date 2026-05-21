import type { AuthUserDTO, LoginResponseDTO } from '../../dto/authDto'

export const mockUsers: AuthUserDTO[] = [
  { id: 'user-1', name: 'Admin Master', email: 'admin@admin.com', role: 'superadmin', avatar_url: '', active: true },
  { id: 'user-2', name: 'João Restaurante', email: 'joao@burgerhouse.com', role: 'admin', company_id: 'comp-1', branch_id: 'branch-1', avatar_url: '', active: true },
  { id: 'user-3', name: 'Maria Cozinha', email: 'maria@sakura.com', role: 'branch_manager', company_id: 'comp-2', avatar_url: '', active: true },
  { id: 'user-4', name: 'Carlos Entregas', email: 'carlos@delivery.com', role: 'courier', branch_id: 'branch-1', avatar_url: '', active: true },
  { id: 'user-5', name: 'Ana Cliente', email: 'ana@email.com', role: 'customer', avatar_url: '', active: true },
]

const defaultUser: AuthUserDTO = {
  id: 'user-1', name: 'Admin Master', email: 'admin@admin.com', role: 'superadmin', avatar_url: '', active: true,
}

export const mockLoginResponse: LoginResponseDTO = {
  user: defaultUser,
  token: 'mock-jwt-token-superadmin',
  refreshToken: 'mock-refresh-token',
  expiresIn: 86400,
}

export function loginMock(email: string, _password: string): LoginResponseDTO | null {
  const user = mockUsers.find(u => u.email === email)
  if (!user) return null
  return {
    user,
    token: `mock-jwt-token-${user.role}`,
    refreshToken: 'mock-refresh-token',
    expiresIn: 86400,
  }
}
