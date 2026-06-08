import type { AdminUser } from 'src/domain/entities/User';
import { mockUsers } from './auth';

export const mockAdminUsers: AdminUser[] = mockUsers
  .filter(u => u.role !== 'customer')
  .map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatarUrl: u.avatarUrl,
    active: u.active,
    createdAt: new Date().toISOString(),
  }));
