import { useState, useCallback } from 'react';
import { MerchantLayout } from '../components/MerchantLayout';
import { Button } from '../../../components/ui/Button';
import { useBusinessHours, useUpdateBusinessHours, useBranchStatus } from '../../../hooks/useOperations';
import { usePersistentState } from '../../../hooks/usePersistentState';
import { useBranches } from '../../../hooks/useMerchantData';

const WEEKDAYS = [
  { key: 'monday', label: 'Segunda' },
  { key: 'tuesday', label: 'Terça' },
  { key: 'wednesday', label: 'Quarta' },
  { key: 'thursday', label: 'Quinta' },
  { key: 'friday', label: 'Sexta' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
] as const;

interface PeriodForm {
  openTime: string;
  closeTime: string;
}

interface DayForm {
  weekday: string;
  isClosed: boolean;
  is24h: boolean;
  periods: PeriodForm[];
}

const defaultWeek: DayForm[] = WEEKDAYS.map((d) => ({
  weekday: d.key,
  isClosed: d.key === 'sunday',
  is24h: false,
  periods: [{ openTime: '08:00', closeTime: '22:00' }],
}));

export function MerchantHoursPage() {
  const { data: branches = [] } = useBranches();
  const [selectedBranch, setSelectedBranch] = usePersistentState<string>('merchant.hours.branch', branches[0]?.id ?? '');
  const { data: hours, isLoading } = useBusinessHours(selectedBranch || undefined);
  const { data: status } = useBranchStatus(selectedBranch || undefined);
  const updateHours = useUpdateBusinessHours(selectedBranch || undefined);

  const [week, setWeek] = useState<DayForm[]>(defaultWeek);
  const [hasSyncedWeek, setHasSyncedWeek] = useState(false);
  const [prevSyncBranch, setPrevSyncBranch] = useState(selectedBranch);

  if (selectedBranch !== prevSyncBranch) {
    setPrevSyncBranch(selectedBranch);
    setHasSyncedWeek(false);
  }

  if (!hasSyncedWeek && hours) {
    setHasSyncedWeek(true);
    setWeek(hours.length > 0
      ? WEEKDAYS.map((d) => {
          const existing = hours.find((h) => h.weekday === d.key);
          if (!existing) return { weekday: d.key, isClosed: d.key === 'sunday', is24h: false, periods: [{ openTime: '08:00', closeTime: '22:00' }] };
          return {
            weekday: d.key,
            isClosed: existing.is_closed ?? false,
            is24h: existing.is_24h ?? false,
            periods: existing.periods.length > 0
              ? existing.periods.map((p) => ({ openTime: p.open_time, closeTime: p.close_time }))
              : [{ openTime: '08:00', closeTime: '22:00' }],
          };
        })
      : defaultWeek
    );
  }

  const updateDay = useCallback((weekday: string, patch: Partial<DayForm>) => {
    setWeek((prev) => prev.map((d) => d.weekday === weekday ? { ...d, ...patch } : d));
  }, []);

  const updatePeriod = useCallback((weekday: string, index: number, patch: Partial<PeriodForm>) => {
    setWeek((prev) => prev.map((d) => {
      if (d.weekday !== weekday) return d;
      const periods = d.periods.map((p, i) => i === index ? { ...p, ...patch } : p);
      return { ...d, periods };
    }));
  }, []);

  const addPeriod = useCallback((weekday: string) => {
    setWeek((prev) => prev.map((d) => {
      if (d.weekday !== weekday) return d;
      return { ...d, periods: [...d.periods, { openTime: '12:00', closeTime: '18:00' }] };
    }));
  }, []);

  const removePeriod = useCallback((weekday: string, index: number) => {
    setWeek((prev) => prev.map((d) => {
      if (d.weekday !== weekday) return d;
      const periods = d.periods.filter((_, i) => i !== index);
      return { ...d, periods: periods.length > 0 ? periods : [{ openTime: '08:00', closeTime: '22:00' }] };
    }));
  }, []);

  const duplicateToAll = useCallback((sourceWeekday: string) => {
    const source = week.find((d) => d.weekday === sourceWeekday);
    if (!source) return;
    setWeek((prev) => prev.map((d) => ({
      ...d,
      isClosed: source.isClosed,
      is24h: source.is24h,
      periods: source.periods.map((p) => ({ ...p })),
    })));
  }, [week]);

  const handleSave = () => {
    updateHours.mutate({
      branchId: selectedBranch,
      hours: week.map((d) => ({
        branchId: selectedBranch,
        weekday: d.weekday,
        isClosed: d.isClosed,
        is24h: d.is24h,
        sortOrder: 0,
        periods: d.isClosed || d.is24h ? [] : d.periods.map((p, i) => ({ openTime: p.openTime, closeTime: p.closeTime, sortOrder: i })),
      })),
    });
  };

  return (
    <MerchantLayout
      title="Horários de funcionamento"
      actions={
         <select
           value={selectedBranch}
           onChange={(e) => { setSelectedBranch(e.target.value); }}
           className="h-10 rounded-lg border border-border-default bg-surface-background px-3 text-sm"
         >
           {branches.map((b) => (
             <option key={b.id} value={b.id}>{b.name}</option>
           ))}
         </select>
      }
    >
      {status && (
        <div className="mb-4 rounded-xl border border-border-default bg-surface-elevated p-4">
          <div className="flex items-center gap-3">
            <span className={`inline-block h-3 w-3 rounded-full ${status.isOpen ? 'bg-feedback-success' : 'bg-feedback-error'}`} />
            <span className="font-semibold text-text-primary">
              {status.isOpen ? 'Aberto agora' : 'Fechado'}
            </span>
            {status.currentPeriod && (
              <span className="text-sm text-text-secondary">
                {status.currentPeriod.openTime} - {status.currentPeriod.closeTime}
              </span>
            )}
            {status.nextOpening && (
              <span className="text-sm text-text-secondary">
                Abre às {status.nextOpening.openTime}
                {status.nextOpeningDate && ` (${status.nextOpeningDate})`}
              </span>
            )}
            {status.overrideLabel && (
              <span className="rounded-full bg-feedback-warning/10 px-2 py-0.5 text-xs font-medium text-feedback-warning">
                {status.overrideLabel}
              </span>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <span className="block h-6 w-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {WEEKDAYS.map((day) => {
            const dayForm = week.find((d) => d.weekday === day.key);
            if (!dayForm) return null;

            return (
              <div key={day.key} className="rounded-xl border border-border-default bg-surface-elevated p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text-primary">{day.label}</span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-sm text-text-secondary">
                      <input
                        type="checkbox"
                        checked={dayForm.is24h}
                        onChange={(e) => { updateDay(day.key, { is24h: e.target.checked, isClosed: false }); }}
                        className="accent-brand-primary"
                      />
                      24h
                    </label>
                    <label className="flex items-center gap-1.5 text-sm text-text-secondary">
                      <input
                        type="checkbox"
                        checked={dayForm.isClosed}
                        onChange={(e) => { updateDay(day.key, { isClosed: e.target.checked, is24h: false }); }}
                        className="accent-feedback-error"
                      />
                      Fechado
                    </label>
                    <button
                      onClick={() => { duplicateToAll(day.key); }}
                      className="text-xs text-brand-primary hover:text-brand-primary-hover"
                      title="Replicar para todos os dias"
                    >
                      Replicar
                    </button>
                  </div>
                </div>

                {!dayForm.isClosed && !dayForm.is24h && (
                  <div className="mt-3 space-y-2">
                    {dayForm.periods.map((period, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={period.openTime}
                          onChange={(e) => { updatePeriod(day.key, idx, { openTime: e.target.value }); }}
                          className="h-9 rounded-lg border border-border-default bg-surface-background px-2 text-sm"
                        />
                        <span className="text-sm text-text-secondary">até</span>
                        <input
                          type="time"
                          value={period.closeTime}
                          onChange={(e) => { updatePeriod(day.key, idx, { closeTime: e.target.value }); }}
                          className="h-9 rounded-lg border border-border-default bg-surface-background px-2 text-sm"
                        />
                        {dayForm.periods.length > 1 && (
                          <button
                            onClick={() => { removePeriod(day.key, idx); }}
                            className="text-feedback-error hover:text-feedback-error/80"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => { addPeriod(day.key); }}
                      className="text-xs text-brand-primary hover:text-brand-primary-hover"
                    >
                      + Adicionar horário
                    </button>
                  </div>
                )}

                {dayForm.isClosed && (
                  <p className="mt-2 text-sm text-text-secondary">Fechado neste dia</p>
                )}
                {dayForm.is24h && (
                  <p className="mt-2 text-sm text-feedback-success font-medium">Aberto 24 horas</p>
                )}
              </div>
            );
          })}

          <div className="mt-4">
            <Button
              fullWidth
              onClick={handleSave}
              disabled={updateHours.isPending}
            >
              {updateHours.isPending ? 'Salvando...' : 'Salvar horários'}
            </Button>
          </div>
        </div>
      )}
    </MerchantLayout>
  );
}
