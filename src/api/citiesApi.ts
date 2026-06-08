import type { ActiveCityDTO, ActiveNeighborhoodDTO } from '../dto/restaurantDto';
import { httpClient } from './httpClient';

export const citiesApi = {
  async listActive(): Promise<ActiveCityDTO[]> {
    return httpClient.get<ActiveCityDTO[]>('/cities/active');
  },

  async listActiveNeighborhoods(city: string, state: string): Promise<ActiveNeighborhoodDTO[]> {
    const params = new URLSearchParams({ city, state });
    return httpClient.get<ActiveNeighborhoodDTO[]>(`/neighborhoods/active?${params.toString()}`);
  },

  async hasCityCoverage(city: string, state: string): Promise<boolean> {
    const params = new URLSearchParams({ city, state });
    const result = await httpClient.get<{ covered: boolean }>(`/cities/has-coverage?${params.toString()}`);
    return result.covered;
  },

  async hasNeighborhoodCoverage(city: string, state: string, neighborhood: string): Promise<boolean> {
    const params = new URLSearchParams({ city, state, neighborhood });
    const result = await httpClient.get<{ covered: boolean }>(`/neighborhoods/has-coverage?${params.toString()}`);
    return result.covered;
  },
};
