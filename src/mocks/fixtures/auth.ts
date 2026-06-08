import type { AuthUserDTO, LoginResponseDTO } from '../../dto/authDto';
import { MOCK_USERS } from '../../auth/dev-mock-data';

function toAuthUserDTO(user: (typeof MOCK_USERS)[number]): AuthUserDTO {
  const dto: AuthUserDTO = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar_url: user.avatarUrl,
    active: user.active,
  };
  if (user.companyId !== undefined) dto.company_id = user.companyId;
  if (user.branchId !== undefined) dto.branch_id = user.branchId;
  return dto;
}

export const mockUsers: AuthUserDTO[] = MOCK_USERS.map(toAuthUserDTO);

const firstUser = MOCK_USERS[0];

if (!firstUser) {
  throw new Error('MOCK_USERS is empty; cannot build mock auth fixture.');
}

const defaultUser: AuthUserDTO = mockUsers[0] ?? toAuthUserDTO(firstUser);

export const mockLoginResponse: LoginResponseDTO = {
  user: defaultUser,
  token: 'mock-jwt-token-superadmin',
  refreshToken: 'mock-refresh-token',
  expiresIn: 86400,
};

export function loginMock(email: string, _password: string): LoginResponseDTO | null {
  const dto = mockUsers.find((u) => u.email === email);
  if (!dto) return null;
  return {
    user: dto,
    token: `mock-jwt-token-${dto.role}`,
    refreshToken: 'mock-refresh-token',
    expiresIn: 86400,
  };
}
