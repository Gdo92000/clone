import type { AuthUser } from '../modules/auth/types';
import { authApi } from '../api';
import { authUserListDtoToModel, authUserDtoToModel } from '../mappers/authMapper';

export async function login(email: string, password: string): Promise<AuthUser> {
  const result = await authApi.login(email, password);
  return authUserDtoToModel(result.user);
}

export async function logout(): Promise<void> {
  await authApi.logout();
}

export async function getUsers(): Promise<AuthUser[]> {
  return authApi.getUsers().then(authUserListDtoToModel);
}