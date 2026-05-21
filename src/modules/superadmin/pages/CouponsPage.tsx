import { useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { useGlobalCoupons, useSaveGlobalCoupon, useDeleteGlobalCoupon, useToggleGlobalCoupon } from '../../../hooks/useSuperadminData';
import type { GlobalCouponDTO } from '../../../dto/superadminDto';
import { clsx } from 'clsx';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';

interface GlobalCouponForm {
  code: string;
  discount: number;
  discount_type: string;
  min_order: number;
  max_uses: number;
  active: boolean;
  expires_at: string;
}

const emptyForm: GlobalCouponForm = {
  code: '', discount: 10, discount_type: 'percentage',
  min_order: 0, max_uses: 100, active: true, expires_at: '',
};

export function CouponsPage() {
  const { data: coupons = [], isLoading, error } = useGlobalCoupons();
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<GlobalCouponForm>(emptyForm);

  const saveMutation = useSaveGlobalCoupon(editingId);
  const removeMutation = useDeleteGlobalCoupon();
  const toggleMutation = useToggleGlobalCoupon();

  const filtered = coupons.filter((c) => {
    const matchSearch = c.code.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (showInactive || c.active);
  });

  const resetForm = () => { setForm(emptyForm); setShowForm(false); setEditingId(null); };

  const openNew = () => {
    setForm({ ...emptyForm, expires_at: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10) });
    setShowForm(true);
  };

  const openEdit = (c: GlobalCouponDTO) => {
    setForm({
      code: c.code, discount: c.discount, discount_type: c.discount_type,
      min_order: c.min_order, max_uses: c.max_uses, active: c.active, expires_at: c.expires_at.slice(0, 10),
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const save = () => {
    if (!form.code.trim()) return;
    saveMutation.mutate(form as unknown as Record<string, unknown>, { onSuccess: () => { resetForm(); } });
  };

  const remove = (id: string) => { removeMutation.mutate(id); };

  const toggleActive = (coupon: GlobalCouponDTO) => { toggleMutation.mutate({ id: coupon.id, data: { active: !coupon.active } }); };

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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={resetForm}>
            <div className="bg-surface-elevated rounded-2xl border border-border-default shadow-xl w-full max-w-lg mx-4 p-6 space-y-4" onClick={(e) => { e.stopPropagation(); }}>
              <h3 className="font-semibold text-lg text-text-primary">{editingId ? 'Editar cupom' : 'Novo cupom'}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-text-secondary font-medium">Código</label>
                  <input type="text" value={form.code} onChange={(e) => { setForm({ ...form, code: e.target.value.toUpperCase() }); }}
                    className="w-full h-10 px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus" placeholder="Ex: PROMO30" />
                </div>
                <div>
                  <label className="text-xs text-text-secondary font-medium">Tipo</label>
                  <select value={form.discount_type} onChange={(e) => { setForm({ ...form, discount_type: e.target.value }); }}
                    className="w-full h-10 px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus">
                    <option value="percentage">Porcentagem</option>
                    <option value="fixed">Valor fixo</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-secondary font-medium">Valor</label>
                  <input type="number" value={form.discount} onChange={(e) => { setForm({ ...form, discount: Number(e.target.value) }); }}
                    className="w-full h-10 px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus" min={0} />
                </div>
                <div>
                  <label className="text-xs text-text-secondary font-medium">Pedido mínimo (R$)</label>
                  <input type="number" value={form.min_order} onChange={(e) => { setForm({ ...form, min_order: Number(e.target.value) }); }}
                    className="w-full h-10 px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus" min={0} />
                </div>
                <div>
                  <label className="text-xs text-text-secondary font-medium">Usos máximos</label>
                  <input type="number" value={form.max_uses} onChange={(e) => { setForm({ ...form, max_uses: Number(e.target.value) }); }}
                    className="w-full h-10 px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus" min={1} />
                </div>
                <div>
                  <label className="text-xs text-text-secondary font-medium">Válido até</label>
                  <input type="date" value={form.expires_at} onChange={(e) => { setForm({ ...form, expires_at: e.target.value }); }}
                    className="w-full h-10 px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="solid" intent="primary" className="flex-1" loading={saveMutation.isPending} disabled={!form.code.trim()} onClick={save}>Salvar</Button>
                <Button variant="outline" intent="secondary" className="flex-1" onClick={resetForm}>Cancelar</Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((coupon) => (
            <article key={coupon.id} className={clsx('rounded-xl border bg-surface-elevated p-4 transition-all', coupon.active ? 'border-border-default' : 'border-border-disabled opacity-70')}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg text-brand-primary">{coupon.code}</span>
                    <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', coupon.active ? 'bg-feedback-success/10 text-feedback-success' : 'bg-text-disabled/10 text-text-disabled')}>{coupon.active ? 'Ativo' : 'Inativo'}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-text-tertiary">Desconto</span><span className="font-semibold text-text-primary">{coupon.discount_type === 'percentage' ? `${coupon.discount}%` : `R$ ${coupon.discount.toFixed(2)}`}</span></div>
                <div className="flex justify-between"><span className="text-text-tertiary">Pedido mín.</span><span className="font-medium text-text-primary">R$ {coupon.min_order.toFixed(2).replace('.', ',')}</span></div>
                <div className="flex justify-between"><span className="text-text-tertiary">Validade</span><span className="font-medium text-text-primary">{new Date(coupon.expires_at).toLocaleDateString('pt-BR')}</span></div>
                <div className="flex justify-between"><span className="text-text-tertiary">Usos</span><span className="font-medium text-text-primary">{coupon.current_uses}/{coupon.max_uses}</span></div>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-surface-background overflow-hidden">
                <div className={clsx('h-full rounded-full', usagePercent(coupon) > 80 ? 'bg-feedback-error' : 'bg-brand-primary')} style={{ width: `${usagePercent(coupon)}%` }} />
              </div>
              <p className="text-xs text-text-tertiary mt-1">{usagePercent(coupon)}% utilizado</p>
              <div className="flex gap-2 mt-4 pt-3 border-t border-border-default">
                <Button variant="outline" intent="secondary" size="sm" className="flex-1" disabled={toggleMutation.isPending} onClick={() => { toggleActive(coupon); }}>{coupon.active ? 'Pausar' : 'Ativar'}</Button>
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
