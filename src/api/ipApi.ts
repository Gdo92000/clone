import { httpClient } from './httpClient';

export interface IpApiResponse {
  ip: string;
  city: string;
  region: string;
  region_code?: string;
  country: string;
  country_code: string;
  continent_code?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  utc_offset?: string;
  country_calling_code?: string;
  currency?: string;
  languages?: string;
  asn?: string;
  org?: string;
  message?: string;
  status?: string;
}

export const ipApi = {
  // For ipapi.co
  getLocationByIp: (): Promise<IpApiResponse> => {
    return httpClient.get<IpApiResponse>('/ipapi/json/');
  },

  getLocationByIpAlternative: (): Promise<IpApiResponse> => {
    return httpClient.get<IpApiResponse>('/ip-api/json/');
  }
};