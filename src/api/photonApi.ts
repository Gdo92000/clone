import { httpClient } from './httpClient';

export interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    osm_type?: string;
    osm_id?: number;
    osm_key?: string;
    osm_value?: string;
    type?: string;
    name?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
    state?: string;
    country?: string;
    countrycode?: string;
    county?: string;
    locality?: string;
    district?: string;
    suburb?: string;
    neighbourhood?: string;
    extent?: number[];
  };
}

export const photonApi = {
  search: (query: string): Promise<{ features?: PhotonFeature[] } | null> => {
    return httpClient.get<{ features?: PhotonFeature[] } | null>(`/photon?q=${encodeURIComponent(query)}&limit=8&lang=default`);
  }
};