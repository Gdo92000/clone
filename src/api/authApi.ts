import { post, get } from './httpClient';
import type { LoginResponseDTO, AuthUserDTO } from '../dto/authDto';

export const authApi = {
  login: (email: string, password: string) =>
    post<LoginResponseDTO>('/auth/login', { email, password }),
  logout: () => post<void>('/auth/logout'),
  getUsers: () => get<AuthUserDTO[]>('/users'),
};