import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { merchantApi } from '../api/merchantApi';
import { merchantKeys } from '../api/queryKeys';
import type { PrinterConfigDTO, PrintHistoryDTO } from '../dto/superadminDto';
import { successToast, errorToast } from '../lib/toast';

const STALE_MEDIUM = 1000 * 60 * 5;

export function usePrinterConfig(branchId: string) {
  return useQuery<PrinterConfigDTO>({
    queryKey: merchantKeys.printerConfig(branchId),
    queryFn: () => merchantApi.getPrinterConfig(branchId),
    enabled: !!branchId,
  });
}

export function usePrintHistory(branchId: string) {
  return useQuery<PrintHistoryDTO[]>({
    queryKey: merchantKeys.printHistory(branchId),
    queryFn: () => merchantApi.getPrintHistory(branchId),
    enabled: !!branchId,
    staleTime: STALE_MEDIUM,
  });
}

export function useSavePrinterConfig(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PrinterConfigDTO>) => merchantApi.savePrinterConfig(branchId, data),
    onSuccess: () => {
      successToast('Configuração de impressora salva');
      void queryClient.invalidateQueries({ queryKey: merchantKeys.printerConfig(branchId) });
    },
    onError: () => { errorToast('Erro ao salvar configuração'); },
  });
}
