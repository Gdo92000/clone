import { post, get } from './httpClient';
import type { LoginResponseDTO, AuthUserDTO } from '../dto/authDto';

export const authApi = {
  login: (email: string, password: string) =>
    post<LoginResponseDTO>('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    post<{ success: boolean; id: string }>('/auth/register', { name, email, password }),
  logout: () => post<Record<string, never>>('/auth/logout'),
  me: () => get<AuthUserDTO>('/auth/me'),
    getUsers: () => get<AuthUserDTO[]>('/admin/users'),
};
