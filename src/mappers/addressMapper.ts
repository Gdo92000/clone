import type { AddressDTO, CreateAddressRequest, UpdateAddressRequest } from '../dto/addressDto';
import type { Address } from '../types';

export function addressDtoToModel(dto: AddressDTO): Address {
  return {
    id: dto.id,
    label: dto.label,
    street: dto.street,
    number: dto.number,
    complement: dto.complement ?? '',
    neighborhood: dto.neighborhood ?? '',
    city: dto.city,
    state: dto.state,
    zipCode: dto.zip_code ?? '',
    isDefault: dto.is_default,
    ...(dto.latitude !== null && dto.longitude !== null
      ? { coordinates: { lat: dto.latitude, lng: dto.longitude } }
      : {}),
  };
}

export function addressListDtoToModel(dtos: AddressDTO[]): Address[] {
  return dtos.map(addressDtoToModel);
}

export function addressModelToCreateRequest(model: Omit<Address, 'id' | 'isDefault'> & { isDefault?: boolean }): CreateAddressRequest {
  return {
    label: model.label,
    street: model.street,
    number: model.number,
    complement: model.complement || null,
    neighborhood: model.neighborhood || null,
    city: model.city,
    state: model.state,
    zip_code: model.zipCode || null,
    ...(model.coordinates
      ? { latitude: model.coordinates.lat, longitude: model.coordinates.lng }
      : {}),
    is_default: model.isDefault ?? false,
  };
}

export function addressModelToUpdateRequest(model: Partial<Address>): UpdateAddressRequest {
  const req: UpdateAddressRequest = {};
  if (model.label !== undefined) req.label = model.label;
  if (model.street !== undefined) req.street = model.street;
  if (model.number !== undefined) req.number = model.number;
  if (model.complement !== undefined) req.complement = model.complement || null;
  if (model.neighborhood !== undefined) req.neighborhood = model.neighborhood || null;
  if (model.city !== undefined) req.city = model.city;
  if (model.state !== undefined) req.state = model.state;
  if (model.zipCode !== undefined) req.zip_code = model.zipCode || null;
  if (model.coordinates !== undefined) {
    req.latitude = model.coordinates.lat;
    req.longitude = model.coordinates.lng;
  }
  if (model.isDefault !== undefined) req.is_default = model.isDefault;
  return req;
}
