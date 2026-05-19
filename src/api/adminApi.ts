import { get, put } from './httpClient';
import type { AuthUserDTO } from '../dto/authDto';

export const adminApi = {
  getUsers: () => get<AuthUserDTO[]>('/admin/users'),
  getUser: (id: string) => get<AuthUserDTO>(`/admin/users/${id}`),
  updateUser: (id: string, data: Partial<{ name: string; role: string; is_active: boolean }>) =>
    put<AuthUserDTO>(`/admin/users/${id}`, data),
};
