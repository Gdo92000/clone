import { get, post, put, del } from './httpClient';

export interface CoverageCityDTO {
  id: string;
  name: string;
  state: string;
  latitude: string;
  longitude: string;
  radius_km: number;
  restaurant_count: number;
  is_active: boolean;
  created_at: string;
}

export const coverageCityApi = {
  list: () => get<CoverageCityDTO[]>('/coverage-cities'),
  getById: (id: string) => get<CoverageCityDTO>(`/coverage-cities/${id}`),
  create: (data: { name: string; state: string; latitude: number; longitude: number; radiusKm?: number }) =>
    post<CoverageCityDTO>('/coverage-cities/admin', data),
  update: (id: string, data: Partial<{ name: string; state: string; latitude: number; longitude: number; radiusKm: number }>) =>
    put<CoverageCityDTO>(`/coverage-cities/admin/${id}`, data),
  toggle: (id: string) => post<CoverageCityDTO>(`/coverage-cities/admin/${id}/toggle`),
  delete: (id: string) => del<void>(`/coverage-cities/admin/${id}`),
  seed: () => post<{ seeded: number; reason?: string }>('/coverage-cities/admin/seed'),
};
