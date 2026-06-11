import { get, post, put, patch } from './httpClient';

export interface TeamMemberDTO {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  sub_role: string | null;
  is_active: boolean;
  company_id: string | null;
  branch_id: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface InviteTeamMemberDTO {
  name: string;
  email: string;
  role: 'company_owner' | 'branch_manager' | 'attendant' | 'finance';
  branch_id: string;
}

export interface UpdateTeamMemberDTO {
  name?: string;
  email?: string;
  role?: 'company_owner' | 'branch_manager' | 'attendant' | 'finance';
  branch_id?: string;
  is_active?: boolean;
}

export const teamApi = {
  list: () => get<TeamMemberDTO[]>('/team'),
  get: (id: string) => get<TeamMemberDTO>(`/team/${id}`),
  invite: (data: InviteTeamMemberDTO) => post<{ success: boolean; id: string; temporaryPassword?: string }>('/team/invite', data),
  update: (id: string, data: UpdateTeamMemberDTO) => put<{ success: boolean }>(`/team/${id}`, data),
  deactivate: (id: string) => patch<{ success: boolean }>(`/team/${id}/deactivate`),
  reactivate: (id: string) => patch<{ success: boolean }>(`/team/${id}/reactivate`),
};
