import { addressApi } from '../api/addressApi';
import { addressDtoToModel, addressListDtoToModel, addressModelToCreateRequest, addressModelToUpdateRequest } from '../mappers/addressMapper';
import type { Address } from '../types';
import type { CreateAddressRequest, UpdateAddressRequest } from '../dto/addressDto';

export async function getAddresses(): Promise<Address[]> {
  const dtos = await addressApi.list();
  return addressListDtoToModel(dtos);
}

export async function createAddress(data: Omit<Address, 'id' | 'isDefault'> & { isDefault?: boolean }): Promise<Address> {
  const dto = await addressApi.create(addressModelToCreateRequest(data));
  const result = addressListDtoToModel([dto])[0];
  if (!result) throw new Error('Falha ao criar endereço');
  return result;
}

export async function updateAddress(id: string, data: Partial<Address>): Promise<Address> {
  const req: UpdateAddressRequest = addressModelToUpdateRequest(data);
  const dto = await addressApi.update(id, req);
  const result = addressListDtoToModel([dto])[0];
  if (!result) throw new Error('Falha ao atualizar endereço');
  return result;
}

export async function setDefaultAddress(id: string): Promise<Address> {
  const dto = await addressApi.setDefault(id);
  const result = addressListDtoToModel([dto])[0];
  if (!result) throw new Error('Falha ao definir endereço padrão');
  return result;
}

export async function deleteAddress(id: string): Promise<void> {
  await addressApi.delete(id);
}

export type { CreateAddressRequest };
export { addressDtoToModel };
