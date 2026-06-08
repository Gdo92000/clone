import type { RestaurantAvailabilityDTO } from '../dto/restaurantDto';
import { httpClient } from './httpClient';

export const restaurantAvailabilityApi = {
  async setAvailability(id: string, isActive: boolean): Promise<RestaurantAvailabilityDTO> {
    return httpClient.put<RestaurantAvailabilityDTO>(`/api/restaurants/${id}/availability`, { is_active: isActive });
  },
};
