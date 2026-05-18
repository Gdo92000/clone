import { useState } from 'react';
import { MerchantLayout } from '../components/MerchantLayout';
import { Button } from '../../../components/ui/Button';
import {
  useHolidayOverrides,
  useCreateHolidayOverride,
  useDeleteHolidayOverride,
  useSpecialDates,
  useCreateSpecialDate,
  useDeleteSpecialDate,
  useHolidays,
  useSeedHolidays,
} from '../../../hooks/useOperations';
import { usePersistentState } from '../../../hooks/usePersistentState';
import { useBranches } from '../../../hooks/useMerchantData';

const OVERRIDE_TYPES = [
  { value: 'closed', label: 'Fechado' },
  { value: 'open_normal', label: 'Horário normal' },
  { value: 'custom_hours', label: 'Horário customizado' },
] as const;

interface OverrideForm {
  customDate: string;
  overrideType: 'closed' | 'open_normal' | 'custom_hours';
  holidayRuleId: string;
  periods: { openTime: string; closeTime: string }[];
}

interface SpecialForm {
  date: string;
  label: string;
  isClosed: boolean;
  is24h: boolean;
  periods: { openTime: string; closeTime: string }[];
}

const emptyOverride: OverrideForm = {
  customDate: '',
  overrideType: 'closed',
  holidayRuleId: '',
  periods: [],
};

const emptySpecial: SpecialForm = {
  date: '',
  label: '',
  isClosed: false,
  is24h: false,
  periods: [{ openTime: '08:00', closeTime: '22:00' }],
};

export function MerchantHolidaysPage() {
  const { data: branches = [] } = useBranches();
  const [selectedBranch, setSelectedBranch] = usePersistentState<string>('merchant.holidays.branch', branches[0]?.id ?? '');
  const { data: overrides = [], isLoading: loadingOverrides } = useHolidayOverrides(selectedBranch || undefined);
  const { data: specials = [], isLoading: loadingSpecials } = useSpecialDates(selectedBranch || undefined);
  const { data: holidays = [] } = useHolidays();
  const createOverride = useCreateHolidayOverride(selectedBranch || undefined);
  const deleteOverride = useDeleteHolidayOverride(selectedBranch || undefined);
  const createSpecial = useCreateSpecialDate(selectedBranch || undefined);
  const deleteSpecial = useDeleteSpecialDate(selectedBranch || undefined);
  const seedHolidays = useSeedHolidays();

  const [tab, setTab] = useState<'holidays' | 'special'>('holidays');
  const [overrideForm, setOverrideForm] = useState<OverrideForm>(emptyOverride);
  const [specialForm, setSpecialForm] = useState<SpecialForm>(emptySpecial);

  const handleSeedCurrentYear = () => {
    seedHolidays.mutate(new Date().getFullYear());
  };

  const handleCreateOverride = () => {
    if (!overrideForm.customDate) return;
    createOverride.mutate({
      branchId: selectedBranch,
      overrideType: overrideForm.overrideType,
      customDate: overrideForm.customDate,
      holidayRuleId: overrideForm.holidayRuleId || undefined,
      periods: overrideForm.overrideType === 'custom_hours' ? overrideForm.periods : [],
    }, { onSuccess: () => { setOverrideForm(emptyOverride); } });
  };

  const handleCreateSpecial = () => {
    if (!specialForm.date) return;
    createSpecial.mutate({
      branchId: selectedBranch,
      date: specialForm.date,
      label: specialForm.label || undefined,
      isClosed: specialForm.isClosed,
      is24h: specialForm.is24h,
      periods: specialForm.isClosed || specialForm.is24h ? [] : specialForm.periods,
    }, { onSuccess: () => { setSpecialForm(emptySpecial); } });
  };

  return (
    <MerchantLayout
      title="Feriados e exceções"
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
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => { setTab('holidays'); }}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === 'holidays' ? 'bg-brand-primary text-white' : 'bg-surface-elevated text-text-secondary'}`}
        >
          Feriados
        </button>
        <button
          onClick={() => { setTab('special'); }}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === 'special' ? 'bg-brand-primary text-white' : 'bg-surface-elevated text-text-secondary'}`}
        >
          Datas especiais
        </button>
      </div>

      {tab === 'holidays' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text-primary">Feriados nacionais</h3>
              <Button size="sm" onClick={handleSeedCurrentYear} disabled={seedHolidays.isPending}>
                {seedHolidays.isPending ? 'Carregando...' : 'Carregar feriados do ano'}
              </Button>
            </div>
            {holidays.length > 0 && (
              <div className="mt-3 max-h-40 overflow-y-auto space-y-1">
                {holidays.filter((h) => h.scope === 'national').map((h) => (
                  <div key={h.id} className="flex items-center justify-between rounded-lg bg-surface-background px-3 py-1.5 text-sm">
                    <span className="text-text-primary">{h.name}</span>
                    <span className="text-text-secondary">{h.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
            <h3 className="font-semibold text-text-primary">Nova exceção de feriado</h3>
            <div className="mt-3 space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-text-primary">Data</span>
                <input
                  type="date"
                  value={overrideForm.customDate}
                  onChange={(e) => { setOverrideForm({ ...overrideForm, customDate: e.target.value }); }}
                  className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
                />
              </label>

              <div>
                <span className="text-sm font-medium text-text-primary">Tipo de exceção</span>
                <div className="mt-1 flex gap-2">
                  {OVERRIDE_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => { setOverrideForm({ ...overrideForm, overrideType: t.value, periods: t.value === 'custom_hours' ? [{ openTime: '08:00', closeTime: '22:00' }] : [] }); }}
                      className={`rounded-lg px-3 py-1.5 text-sm ${overrideForm.overrideType === t.value ? 'bg-brand-primary text-white' : 'bg-surface-background text-text-secondary'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {overrideForm.overrideType === 'custom_hours' && (
                <div className="space-y-2">
                  {overrideForm.periods.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={p.openTime}
                        onChange={(e) => {
                          const periods = overrideForm.periods.map((pp, i) => i === idx ? { ...pp, openTime: e.target.value } : pp);
                          setOverrideForm({ ...overrideForm, periods });
                        }}
                        className="h-9 rounded-lg border border-border-default bg-surface-background px-2 text-sm"
                      />
                      <span className="text-sm text-text-secondary">até</span>
                      <input
                        type="time"
                        value={p.closeTime}
                        onChange={(e) => {
                          const periods = overrideForm.periods.map((pp, i) => i === idx ? { ...pp, closeTime: e.target.value } : pp);
                          setOverrideForm({ ...overrideForm, periods });
                        }}
                        className="h-9 rounded-lg border border-border-default bg-surface-background px-2 text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}

              <Button fullWidth onClick={handleCreateOverride} disabled={createOverride.isPending || !overrideForm.customDate}>
                {createOverride.isPending ? 'Salvando...' : 'Adicionar exceção'}
              </Button>
            </div>
          </div>

          {loadingOverrides ? (
            <div className="flex justify-center py-6">
              <span className="block h-5 w-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : overrides.length > 0 ? (
            <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <h3 className="font-semibold text-text-primary">Exceções cadastradas</h3>
              <div className="mt-3 space-y-2">
                {overrides.map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-lg bg-surface-background p-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{o.custom_date}</p>
                      <p className="text-xs text-text-secondary">
                        {o.override_type === 'closed' ? 'Fechado' : o.override_type === 'open_normal' ? 'Horário normal' : 'Horário customizado'}
                      </p>
                      {o.override_type === 'custom_hours' && o.periods.map((p, i) => (
                        <p key={i} className="text-xs text-text-secondary">{p.open_time} - {p.close_time}</p>
                      ))}
                    </div>
                    <button
                      onClick={() => { deleteOverride.mutate(o.id); }}
                      className="text-feedback-error hover:text-feedback-error/80 text-sm"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {tab === 'special' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
            <h3 className="font-semibold text-text-primary">Nova data especial</h3>
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-[1fr_1fr] gap-2">
                <label className="block">
                  <span className="text-sm font-medium text-text-primary">Data</span>
                  <input
                    type="date"
                    value={specialForm.date}
                    onChange={(e) => { setSpecialForm({ ...specialForm, date: e.target.value }); }}
                    className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-text-primary">Descrição</span>
                  <input
                    value={specialForm.label}
                    onChange={(e) => { setSpecialForm({ ...specialForm, label: e.target.value }); }}
                    className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
                    placeholder="Ex: Véspera de Natal"
                  />
                </label>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <input
                    type="checkbox"
                    checked={specialForm.isClosed}
                    onChange={(e) => { setSpecialForm({ ...specialForm, isClosed: e.target.checked, is24h: false }); }}
                    className="accent-feedback-error"
                  />
                  Fechado
                </label>
                <label className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <input
                    type="checkbox"
                    checked={specialForm.is24h}
                    onChange={(e) => { setSpecialForm({ ...specialForm, is24h: e.target.checked, isClosed: false }); }}
                    className="accent-brand-primary"
                  />
                  24 horas
                </label>
              </div>

              {!specialForm.isClosed && !specialForm.is24h && (
                <div className="space-y-2">
                  {specialForm.periods.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={p.openTime}
                        onChange={(e) => {
                          const periods = specialForm.periods.map((pp, i) => i === idx ? { ...pp, openTime: e.target.value } : pp);
                          setSpecialForm({ ...specialForm, periods });
                        }}
                        className="h-9 rounded-lg border border-border-default bg-surface-background px-2 text-sm"
                      />
                      <span className="text-sm text-text-secondary">até</span>
                      <input
                        type="time"
                        value={p.closeTime}
                        onChange={(e) => {
                          const periods = specialForm.periods.map((pp, i) => i === idx ? { ...pp, closeTime: e.target.value } : pp);
                          setSpecialForm({ ...specialForm, periods });
                        }}
                        className="h-9 rounded-lg border border-border-default bg-surface-background px-2 text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}

              <Button fullWidth onClick={handleCreateSpecial} disabled={createSpecial.isPending || !specialForm.date}>
                {createSpecial.isPending ? 'Salvando...' : 'Adicionar data especial'}
              </Button>
            </div>
          </div>

          {loadingSpecials ? (
            <div className="flex justify-center py-6">
              <span className="block h-5 w-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : specials.length > 0 ? (
            <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <h3 className="font-semibold text-text-primary">Datas especiais cadastradas</h3>
              <div className="mt-3 space-y-2">
                {specials.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg bg-surface-background p-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{s.date}{s.label ? ` - ${s.label}` : ''}</p>
                      <p className="text-xs text-text-secondary">
                        {s.is_closed ? 'Fechado' : s.is_24h ? '24 horas' : s.periods.map((p) => `${p.open_time}-${p.close_time}`).join(', ')}
                      </p>
                    </div>
                    <button
                      onClick={() => { deleteSpecial.mutate(s.id); }}
                      className="text-feedback-error hover:text-feedback-error/80 text-sm"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </MerchantLayout>
  );
}
