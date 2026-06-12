import type { TokenPayload } from '../auth/types';

export interface AppVariables {
  requestId: string;
  jwtPayload: TokenPayload;
  tenantId: string;
  resolvedCompanyId: string;
  userCompanyId: string;
  userBranchId: string;
}
