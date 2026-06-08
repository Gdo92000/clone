import type { Coordinates } from '../geospatial/geodesy';
import type { LocationSource, UserLocation } from './types';

export interface UserLocationCityInput {
  name: string;
  state: string;
  stateCode?: string;
  neighborhood?: string;
}

export interface BuildUserLocationInput {
  coordinates: Coordinates | null | undefined;
  city?: UserLocationCityInput | null;
  source: LocationSource;
  timestamp: number;
}

export function buildUserLocation(input: BuildUserLocationInput): UserLocation | null {
  if (!input.coordinates) {
    return null;
  }

  return {
    coordinates: input.coordinates,
    source: input.source,
    timestamp: input.timestamp,
    ...(input.city && {
      city: {
        name: input.city.name,
        state: input.city.state,
        ...(input.city.stateCode && { stateCode: input.city.stateCode }),
        country: 'Brasil',
        ...(input.city.neighborhood && { neighborhood: input.city.neighborhood }),
      },
    }),
  };
}
