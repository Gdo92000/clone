import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from '../repositories/addressRepository';
import { consumerKeys } from '../api/queryKeys';
import { logger } from '../lib/logger';
import type { Address } from '../types';

const STALE_MEDIUM = 1000 * 60 * 5;

export function useAddresses() {
  return useQuery({ queryKey: consumerKeys.addresses, queryFn: getAddresses, staleTime: STALE_MEDIUM });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Address, 'id' | 'isDefault'> & { isDefault?: boolean }) => createAddress(data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: consumerKeys.addresses });
    },
    onError: (error) => {
      logger.error('Addresses', 'Failed to create address', error);
    },
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Address> }) => updateAddress(id, data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: consumerKeys.addresses });
    },
    onError: (error) => {
      logger.error('Addresses', 'Failed to update address', error);
    },
  });
}

export function useSetDefaultAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => setDefaultAddress(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: consumerKeys.addresses });
    },
    onError: (error) => {
      logger.error('Addresses', 'Failed to set default address', error);
    },
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: consumerKeys.addresses });
    },
    onError: (error) => {
      logger.error('Addresses', 'Failed to delete address', error);
    },
  });
}
