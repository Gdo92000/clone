import type { UserRole } from '../modules/auth/types';

export interface AuthUserDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company_id?: string;
  branch_id?: string;
  avatar_url: string;
  active: boolean;
}

export interface LoginResponseDTO {
  user: AuthUserDTO;
  token: string;
}