import { get, put } from './httpClient';
import type { AdminUserDTO } from '../dto/superadminDto';

export const adminApi = {
  getUsers: () => get<AdminUserDTO[]>('/admin/users'),
  getUser: (id: string) => get<AdminUserDTO>(`/admin/users/${id}`),
  updateUser: (id: string, data: Partial<{ name: string; role: string; is_active: boolean }>) =>
    put<{ success: boolean }>(`/admin/users/${id}`, data),
};
