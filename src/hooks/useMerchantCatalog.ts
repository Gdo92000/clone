import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { merchantApi } from '../api/merchantApi';
import { successToast, errorToast } from '../lib/toast';

const MENU_ITEMS_KEY: QueryKey = ['merchant', 'menuItems'];
const branchMenuItemsKey = (branchId: string): QueryKey => ['merchant', 'menuItems', 'branch', branchId];

export interface CreateMenuItemInput {
  branchId: string;
  name: string;
  category: string;
  price: number;
  description?: string;
}

export interface UpdateMenuItemInput {
  branchId: string;
  itemId: string;
  data: { name?: string; category?: string; price?: number; description?: string | null; is_available?: boolean };
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateMenuItemInput) => merchantApi.createMenuItem(input.branchId, {
      name: input.name,
      category: input.category,
      price: input.price,
      description: input.description ?? null,
    }),
    onSuccess: async (_, input) => {
      successToast('Item adicionado ao cardápio');
      await queryClient.invalidateQueries({ queryKey: MENU_ITEMS_KEY });
      await queryClient.invalidateQueries({ queryKey: branchMenuItemsKey(input.branchId) });
    },
    onError: (err: unknown) => {
      errorToast(err instanceof Error ? err.message : 'Erro ao adicionar item');
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateMenuItemInput) => merchantApi.updateMenuItem(input.branchId, input.itemId, input.data),
    onSuccess: async (_, input) => {
      successToast('Item atualizado');
      await queryClient.invalidateQueries({ queryKey: MENU_ITEMS_KEY });
      await queryClient.invalidateQueries({ queryKey: branchMenuItemsKey(input.branchId) });
    },
    onError: (err: unknown) => {
      errorToast(err instanceof Error ? err.message : 'Erro ao atualizar item');
    },
  });
}

export function useToggleMenuItemAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { branchId: string; itemId: string; is_available: boolean }) =>
      merchantApi.toggleMenuItemAvailability(input.branchId, input.itemId, input.is_available),
    onSuccess: async (_, input) => {
      await queryClient.invalidateQueries({ queryKey: MENU_ITEMS_KEY });
      await queryClient.invalidateQueries({ queryKey: branchMenuItemsKey(input.branchId) });
    },
    onError: (err: unknown) => {
      errorToast(err instanceof Error ? err.message : 'Erro ao alterar disponibilidade');
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { branchId: string; itemId: string }) => merchantApi.deleteMenuItem(input.branchId, input.itemId),
    onSuccess: async (_, input) => {
      successToast('Item removido');
      await queryClient.invalidateQueries({ queryKey: MENU_ITEMS_KEY });
      await queryClient.invalidateQueries({ queryKey: branchMenuItemsKey(input.branchId) });
    },
    onError: (err: unknown) => {
      errorToast(err instanceof Error ? err.message : 'Erro ao remover item');
    },
  });
}
