import { useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useGlobalCoupons, useSaveGlobalCoupon, useDeleteGlobalCoupon, useToggleGlobalCoupon } from '../../../hooks/useSuperadminData';
import type { GlobalCouponDTO, CreateGlobalCouponInput } from '../../../dto/superadminDto';
import { clsx } from 'clsx';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';

const emptyForm: CreateGlobalCouponInput = {
  code: '', discount_value: '10', discount_type: 'percentage',
  min_order: '', max_uses: 100, valid_from: '', valid_until: '',
};

export function CouponsPage() {
  const { data: coupons = [], isLoading, error } = useGlobalCoupons();
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateGlobalCouponInput>(emptyForm);

  const saveMutation = useSaveGlobalCoupon(editingId);
  const removeMutation = useDeleteGlobalCoupon();
  const toggleMutation = useToggleGlobalCoupon();

  const filtered = coupons.filter((c) => {
    const matchSearch = c.code.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (showInactive || c.is_active);
  });

  const resetForm = () => { setForm(emptyForm); setShowForm(false); setEditingId(null); };

  const openNew = () => {
    setForm({ ...emptyForm, valid_from: new Date().toISOString().slice(0, 10), valid_until: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10) });
    setShowForm(true);
  };

  const openEdit = (c: GlobalCouponDTO) => {
    setForm({
      code: c.code, discount_value: c.discount_value, discount_type: c.discount_type,
      min_order: c.min_order ?? '', max_uses: c.max_uses, valid_from: c.valid_from.slice(0, 10), valid_until: c.valid_until.slice(0, 10),
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const save = () => {
    if (!form.code.trim()) return;
    saveMutation.mutate(form, { onSuccess: () => { resetForm(); } });
  };

  const remove = (id: string) => { removeMutation.mutate(id); };

  const toggleActive = (coupon: GlobalCouponDTO) => { toggleMutation.mutate({ id: coupon.id, data: { is_active: !coupon.is_active } }); };

  const usagePercent = (c: GlobalCouponDTO) => Math.round((c.current_uses / c.max_uses) * 100);

  return (
    <>
      <PageHeader title="Cupons promocionais" actions={<Button variant="solid" intent="primary" size="sm" onClick={openNew}>Novo cupom</Button>} />

      <FxQueryBoundary isLoading={isLoading} isError={!!error} error={error instanceof Error ? error : null}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="relative max-w-xs">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); }} placeholder="Buscar cupom..."
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-surface-elevated border border-border-default text-text-primary text-sm focus:outline-none focus:border-border-focus" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showInactive} onChange={(e) => { setShowInactive(e.target.checked); }}
              className="w-4 h-4 rounded border-border-default text-brand-primary focus:ring-brand-primary" />
            <span className="text-sm text-text-secondary">Mostrar inativos</span>
          </label>
        </div>

        {showForm && (
          <Modal
            isOpen={showForm}
            onClose={resetForm}
            title={editingId ? 'Editar cupom' : 'Novo cupom'}
            size="lg"
            footer={
              <div className="flex gap-2">
                <Button variant="solid" intent="primary" className="flex-1" loading={saveMutation.isPending} disabled={!form.code.trim()} onClick={save}>Salvar</Button>
                <Button variant="outline" intent="secondary" className="flex-1" onClick={resetForm}>Cancelar</Button>
              </div>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="col-span-2">
                <label htmlFor="sa-coupon-code" className="text-xs text-text-secondary font-medium">Código</label>
                <input id="sa-coupon-code" type="text" value={form.code} onChange={(e) => { setForm({ ...form, code: e.target.value.toUpperCase() }); }}
                  className="w-full h-11 min-h-[44px] px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2" placeholder="Ex: PROMO30" autoCapitalize="characters" />
              </div>
              <div>
                <label htmlFor="sa-coupon-type" className="text-xs text-text-secondary font-medium">Tipo</label>
                <select id="sa-coupon-type" value={form.discount_type} onChange={(e) => { setForm({ ...form, discount_type: e.target.value }); }}
                  className="w-full h-11 min-h-[44px] px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2">
                  <option value="percentage">Porcentagem</option>
                  <option value="fixed">Valor fixo</option>
                </select>
              </div>
              <div>
                <label htmlFor="sa-coupon-value" className="text-xs text-text-secondary font-medium">Valor</label>
                <input id="sa-coupon-value" type="number" inputMode="decimal" value={form.discount_value} onChange={(e) => { setForm({ ...form, discount_value: e.target.value }); }}
                  className="w-full h-11 min-h-[44px] px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2" min={0} step="0.01" />
              </div>
              <div>
                <label htmlFor="sa-coupon-min" className="text-xs text-text-secondary font-medium">Pedido mínimo (R$)</label>
                <input id="sa-coupon-min" type="number" inputMode="decimal" value={form.min_order} onChange={(e) => { setForm({ ...form, min_order: e.target.value }); }}
                  className="w-full h-11 min-h-[44px] px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2" min={0} step="0.01" />
              </div>
              <div>
                <label htmlFor="sa-coupon-max-uses" className="text-xs text-text-secondary font-medium">Usos máximos</label>
                <input id="sa-coupon-max-uses" type="number" inputMode="numeric" value={form.max_uses} onChange={(e) => { setForm({ ...form, max_uses: Number(e.target.value) }); }}
                  className="w-full h-11 min-h-[44px] px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2" min={1} />
              </div>
              <div className="col-span-2">
                <label htmlFor="sa-coupon-from" className="text-xs text-text-secondary font-medium">Válido de</label>
                <input id="sa-coupon-from" type="date" value={form.valid_from} onChange={(e) => { setForm({ ...form, valid_from: e.target.value }); }}
                  className="w-full h-11 min-h-[44px] px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2" />
              </div>
              <div className="col-span-2">
                <label htmlFor="sa-coupon-until" className="text-xs text-text-secondary font-medium">Válido até</label>
                <input id="sa-coupon-until" type="date" value={form.valid_until} onChange={(e) => { setForm({ ...form, valid_until: e.target.value }); }}
                  className="w-full h-11 min-h-[44px] px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2" />
              </div>
            </div>
          </Modal>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((coupon) => (
            <article key={coupon.id} className={clsx('rounded-xl border bg-surface-elevated p-4 transition-all', coupon.is_active ? 'border-border-default' : 'border-border-disabled opacity-70')}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg text-brand-primary">{coupon.code}</span>
                    <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', coupon.is_active ? 'bg-feedback-success/10 text-feedback-success' : 'bg-text-disabled/10 text-text-disabled')}>{coupon.is_active ? 'Ativo' : 'Inativo'}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-text-tertiary">Desconto</span><span className="font-semibold text-text-primary">{coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `R$ ${Number(coupon.discount_value).toFixed(2)}`}</span></div>
                <div className="flex justify-between"><span className="text-text-tertiary">Pedido mín.</span><span className="font-medium text-text-primary">R$ {Number(coupon.min_order ?? 0).toFixed(2).replace('.', ',')}</span></div>
                <div className="flex justify-between"><span className="text-text-tertiary">Validade</span><span className="font-medium text-text-primary">{new Date(coupon.valid_until).toLocaleDateString('pt-BR')}</span></div>
                <div className="flex justify-between"><span className="text-text-tertiary">Usos</span><span className="font-medium text-text-primary">{coupon.current_uses}/{coupon.max_uses}</span></div>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-surface-background overflow-hidden">
                <div className={clsx('h-full rounded-full', usagePercent(coupon) > 80 ? 'bg-feedback-error' : 'bg-brand-primary')} style={{ width: `${usagePercent(coupon)}%` }} />
              </div>
              <p className="text-xs text-text-tertiary mt-1">{usagePercent(coupon)}% utilizado</p>
              <div className="flex gap-2 mt-4 pt-3 border-t border-border-default">
                <Button variant="outline" intent="secondary" size="sm" className="flex-1" disabled={toggleMutation.isPending} onClick={() => { toggleActive(coupon); }}>{coupon.is_active ? 'Pausar' : 'Ativar'}</Button>
                <Button variant="outline" intent="secondary" size="sm" className="flex-1" onClick={() => { openEdit(coupon); }}>Editar</Button>
                <button onClick={() => { remove(coupon.id); }} disabled={removeMutation.isPending} className="p-2 rounded-lg hover:bg-surface-background transition-colors disabled:opacity-50" title="Excluir"><Icon name="Trash2" size={16} className="text-text-tertiary hover:text-feedback-error" /></button>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 rounded-xl border border-border-default bg-surface-elevated">
            <Icon name="Tag" size={40} className="mx-auto text-text-tertiary" />
            <p className="text-text-secondary mt-3">Nenhum cupom encontrado</p>
          </div>
        )}
      </FxQueryBoundary>
    </>
  );
}

export default CouponsPage;
