import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { operationsApi, holidaysApi } from '../api/operationsApi';
import type { OpenStatus, BusinessHour, HolidayOverride, SpecialDate, HolidayRule, TimePeriod } from '../api/operationsApi';
import { operationsKeys } from '../api/queryKeys';

const STALE_SHORT = 1000 * 30;
const STALE_MEDIUM = 1000 * 60 * 2;

export function useBranchStatus(branchId: string | undefined) {
  return useQuery<OpenStatus>({
    queryKey: operationsKeys.status(branchId!),
    queryFn: () => operationsApi.getStatus(branchId!),
    enabled: !!branchId,
    staleTime: STALE_SHORT,
    refetchInterval: STALE_SHORT,
  });
}

export function useTodayPeriods(branchId: string | undefined) {
  return useQuery<TimePeriod[]>({
    queryKey: operationsKeys.todayPeriods(branchId!),
    queryFn: () => operationsApi.getTodayPeriods(branchId!),
    enabled: !!branchId,
    staleTime: STALE_SHORT,
    refetchInterval: STALE_SHORT,
  });
}

export function useBusinessHours(branchId: string | undefined) {
  return useQuery<BusinessHour[]>({
    queryKey: operationsKeys.hours(branchId!),
    queryFn: () => operationsApi.getHours(branchId!),
    enabled: !!branchId,
    staleTime: STALE_MEDIUM,
  });
}

export function useUpdateBusinessHours(branchId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { branchId: string; hours: BusinessHourInput[] }) =>
      operationsApi.updateHours(branchId!, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: operationsKeys.hours(branchId!) });
      void qc.invalidateQueries({ queryKey: operationsKeys.status(branchId!) });
    },
  });
}

interface BusinessHourInput {
  weekday: string;
  isClosed: boolean;
  is24h: boolean;
  sortOrder: number;
  periods: { openTime: string; closeTime: string; sortOrder: number }[];
}

export function useHolidayOverrides(branchId: string | undefined) {
  return useQuery<HolidayOverride[]>({
    queryKey: operationsKeys.holidayOverrides(branchId!),
    queryFn: () => operationsApi.getHolidayOverrides(branchId!),
    enabled: !!branchId,
    staleTime: STALE_MEDIUM,
  });
}

export function useCreateHolidayOverride(branchId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      operationsApi.createHolidayOverride(branchId!, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: operationsKeys.holidayOverrides(branchId!) });
      void qc.invalidateQueries({ queryKey: operationsKeys.status(branchId!) });
    },
  });
}

export function useDeleteHolidayOverride(branchId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => operationsApi.deleteHolidayOverride(branchId!, id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: operationsKeys.holidayOverrides(branchId!) });
      void qc.invalidateQueries({ queryKey: operationsKeys.status(branchId!) });
    },
  });
}

export function useSpecialDates(branchId: string | undefined) {
  return useQuery<SpecialDate[]>({
    queryKey: operationsKeys.specialDates(branchId!),
    queryFn: () => operationsApi.getSpecialDates(branchId!),
    enabled: !!branchId,
    staleTime: STALE_MEDIUM,
  });
}

export function useCreateSpecialDate(branchId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      operationsApi.createSpecialDate(branchId!, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: operationsKeys.specialDates(branchId!) });
      void qc.invalidateQueries({ queryKey: operationsKeys.status(branchId!) });
    },
  });
}

export function useDeleteSpecialDate(branchId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => operationsApi.deleteSpecialDate(branchId!, id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: operationsKeys.specialDates(branchId!) });
      void qc.invalidateQueries({ queryKey: operationsKeys.status(branchId!) });
    },
  });
}

export function useHolidays() {
  return useQuery<HolidayRule[]>({
    queryKey: operationsKeys.holidays,
    queryFn: () => holidaysApi.getAll(),
    staleTime: STALE_MEDIUM,
  });
}

export function useSeedHolidays() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (year: number) => holidaysApi.seedYear(year),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: operationsKeys.holidays });
    },
  });
}
