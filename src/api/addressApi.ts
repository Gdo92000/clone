import { get, post, put, del } from './httpClient';
import type { AddressDTO, CreateAddressRequest, UpdateAddressRequest } from '../dto/addressDto';

export const addressApi = {
  list: () => get<AddressDTO[]>('/me/addresses'),
  create: (data: CreateAddressRequest) => post<AddressDTO>('/me/addresses', data),
  update: (id: string, data: UpdateAddressRequest) => put<AddressDTO>(`/me/addresses/${id}`, data),
  setDefault: (id: string) => post<AddressDTO>(`/me/addresses/${id}/default`, {}),
  delete: (id: string) => del<Record<string, never>>(`/me/addresses/${id}`),
};
