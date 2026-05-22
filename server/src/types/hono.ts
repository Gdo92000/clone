import type { TokenPayload } from '../auth/types';

export interface AppVariables {
  requestId: string;
  jwtPayload: TokenPayload;
  resolvedCompanyId: string;
  userCompanyId: string;
  userBranchId: string;
}
