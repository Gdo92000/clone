import { get, post, put } from './httpClient';

export const planApi = {
  list: () => get<any[]>('/plans'),
  getById: (id: string) => get<any>(`/plans/${id}`),
  create: (data: any) => post<any>('/plans', data),
  update: (id: string, data: any) => put<any>(`/plans/${id}`, data),
};
