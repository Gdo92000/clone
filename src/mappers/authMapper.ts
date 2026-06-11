import type { AuthUser } from '../modules/auth/types';
import type { AuthUserDTO } from '../dto/authDto';

export function authUserDtoToModel(dto: AuthUserDTO): AuthUser {
  const u: AuthUser = { id: dto.id, name: dto.name, email: dto.email, role: dto.role, avatarUrl: dto.avatar_url, active: dto.active };
  if (dto.sub_role !== undefined) u.subRole = dto.sub_role;
  if (dto.company_id !== undefined) u.companyId = dto.company_id;
  if (dto.branch_id !== undefined) u.branchId = dto.branch_id;
  return u;
}

export function authUserListDtoToModel(dtos: AuthUserDTO[]): AuthUser[] {
  return dtos.map(authUserDtoToModel);
}