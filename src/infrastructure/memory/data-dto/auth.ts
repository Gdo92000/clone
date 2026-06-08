import type { AuthUserDTO, LoginResponseDTO } from 'src/dto/authDto'

export const mockUsers: AuthUserDTO[] = [
  { id: 'user-1', name: 'Admin Master', email: 'admin@admin.com', role: 'superadmin', avatar_url: '', active: true },
  { id: 'user-2', name: 'João Restaurante', email: 'joao@burgerhouse.com', role: 'company_owner', company_id: 'comp-1', branch_id: 'branch-1', avatar_url: '', active: true },
  { id: 'user-3', name: 'Maria Cozinha', email: 'maria@sakura.com', role: 'branch_manager', company_id: 'comp-2', branch_id: 'branch-2', avatar_url: '', active: true },
  { id: 'user-4', name: 'Carlos Entregas', email: 'carlos@delivery.com', role: 'courier', branch_id: 'branch-1', avatar_url: '', active: true },
  { id: 'user-5', name: 'Ana Cliente', email: 'ana@email.com', role: 'customer', avatar_url: '', active: true },
  { id: 'user-6', name: 'Admin Municipal', email: 'admin@cidade.com', role: 'admin', avatar_url: '', active: true },
  { id: 'user-7', name: 'Financeiro', email: 'financeiro@burgerhouse.com', role: 'finance', company_id: 'comp-1', branch_id: 'branch-1', avatar_url: '', active: true },
  { id: 'user-8', name: 'Atendente', email: 'atendente@burgerhouse.com', role: 'attendant', company_id: 'comp-1', branch_id: 'branch-1', avatar_url: '', active: true },
  { id: 'user-9', name: 'Pedro Bahia Lanches', email: 'pedro@bahialanches.com', role: 'company_owner', company_id: 'comp-3', branch_id: 'branch-3', avatar_url: '', active: true },
  { id: 'user-10', name: 'Carlos Cliente', email: 'carlos@cliente.com', role: 'customer', avatar_url: '', active: true },
]

let currentUser: AuthUserDTO | null = null

export function setCurrentUser(user: AuthUserDTO): void {
  currentUser = user
}

export function getCurrentUser(): AuthUserDTO | null {
  return currentUser
}

export function loginMock(email: string, _password: string): LoginResponseDTO | null {
  const user = mockUsers.find(u => u.email === email)
  if (!user) return null
  setCurrentUser(user)
  return {
    user,
    token: `mock-jwt-token-${user.role}`,
    refreshToken: 'mock-refresh-token',
    expiresIn: 86400,
  }
}
