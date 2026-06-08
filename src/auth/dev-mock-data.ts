import type { UserRole } from 'src/modules/auth/types';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string;
  branchId?: string;
  avatarUrl: string;
  active: boolean;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: 'dev-superadmin',
    name: 'Admin Master',
    email: 'admin@fluxds.dev',
    role: 'superadmin',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=AM&backgroundColor=6C5CE7',
    active: true,
  },
  {
    id: 'dev-admin',
    name: 'Carlos Gestor',
    email: 'admin@fluxds.dev',
    role: 'admin',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=CG&backgroundColor=0984E3',
    active: true,
  },
  {
    id: 'dev-owner-1',
    name: 'Maria Silva',
    email: 'maria@restaurante1.dev',
    role: 'company_owner',
    companyId: 'company-1',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=MS&backgroundColor=00B894',
    active: true,
  },
  {
    id: 'dev-owner-2',
    name: 'Joao Tanaka',
    email: 'joao@restaurante2.dev',
    role: 'company_owner',
    companyId: 'company-3',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=JT&backgroundColor=00B894',
    active: true,
  },
  {
    id: 'dev-manager-1',
    name: 'Ana Pereira',
    email: 'ana@filial1.dev',
    role: 'branch_manager',
    companyId: 'company-1',
    branchId: 'branch-1',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=AP&backgroundColor=FDCB6E',
    active: true,
  },
  {
    id: 'dev-manager-2',
    name: 'Ricardo Lima',
    email: 'ricardo@filial2.dev',
    role: 'branch_manager',
    companyId: 'company-1',
    branchId: 'branch-2',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=RL&backgroundColor=FDCB6E',
    active: true,
  },
  {
    id: 'dev-attendant',
    name: 'Luiz Santos',
    email: 'luiz@filial1.dev',
    role: 'attendant',
    companyId: 'company-1',
    branchId: 'branch-1',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=LS&backgroundColor=E17055',
    active: true,
  },
  {
    id: 'dev-finance',
    name: 'Fernanda Costa',
    email: 'financeiro@restaurante1.dev',
    role: 'finance',
    companyId: 'company-1',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=FC&backgroundColor=636E72',
    active: true,
  },
  {
    id: 'dev-courier',
    name: 'Pedro Alves',
    email: 'pedro@entregas.dev',
    role: 'courier',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=PA&backgroundColor=6C5CE7',
    active: true,
  },
  {
    id: 'dev-customer',
    name: 'Julia Mendes',
    email: 'julia@cliente.dev',
    role: 'customer',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=JM&backgroundColor=00CEC9',
    active: true,
  },
];

export const MOCK_ACTIVE_USER_KEY = 'fluxds-dev-active-user';