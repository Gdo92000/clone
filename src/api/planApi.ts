import { get, post, put } from './httpClient';
import type { SubscriptionPlanDTO } from '../dto/superadminDto';

export const planApi = {
  list: () => get<SubscriptionPlanDTO[]>('/plans'),
  getById: (id: string) => get<SubscriptionPlanDTO>(`/plans/${id}`),
  create: (data: Record<string, unknown>) => post<SubscriptionPlanDTO>('/plans', data),
  update: (id: string, data: Record<string, unknown>) => put<SubscriptionPlanDTO>(`/plans/${id}`, data),
};
