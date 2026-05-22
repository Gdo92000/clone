import { httpClient } from './httpClient';

export interface NominatimSearchResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
    postcode?: string;
    suburb?: string;
    neighbourhood?: string;
    county?: string;
  };
}

export interface NominatimReverseResult {
  lat: number;
  lon: number;
  display_name: string;
  address?: Record<string, string | undefined>;
}

export const nominatimApi = {
  search: (query: string): Promise<NominatimSearchResult[]> => {
    return httpClient.get<NominatimSearchResult[]>(`/nominatim/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(query)}`);
  },

  reverse: (lat: number, lon: number): Promise<NominatimReverseResult | null> => {
    return httpClient.get<NominatimReverseResult | null>(`/nominatim/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=18`);
  }
};