import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { errorToast, infoToast, successToast } from '../../../lib/toast';
import { globalCouponApi } from '../../../api';
import { useGlobalCoupons } from '../../../hooks/useSuperadminData';
import { clsx } from 'clsx';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';

interface GlobalCoupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
  maxUses: number;
  currentUses: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

type CouponForm = Omit<GlobalCoupon, 'id' | 'currentUses'>;

const emptyForm: CouponForm = {
  code: '', description: '', discountType: 'percentage', discountValue: 10,
  minOrder: 0, maxUses: 100, validFrom: '', validUntil: '', isActive: true,
};

export function CouponsPage() {
  const queryClient = useQueryClient();
  const { data: coupons = [], isLoading, error } = useGlobalCoupons();
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [mutating, setMutating] = useState(false);

  const filtered = coupons.filter((c) => {
    const match = c.code.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    return match && (showInactive || c.isActive);
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['global-coupons'] });

  const resetForm = () => { setForm(emptyForm); setShowForm(false); setEditingId(null); };

  const openNew = () => { setForm({ ...emptyForm, validFrom: new Date().toISOString().slice(0, 10), validUntil: new Date(Date.now() + 90*86400000).toISOString().slice(0, 10) }); setShowForm(true); };

  const openEdit = (c: GlobalCoupon) => { setForm({ code: c.code, description: c.description, discountType: c.discountType, discountValue: c.discountValue, minOrder: c.minOrder, maxUses: c.maxUses, validFrom: c.validFrom, validUntil: c.validUntil, isActive: c.isActive }); setEditingId(c.id); setShowForm(true); };

  const save = async () => {
    if (!form.code.trim() || !form.description.trim()) return;
    setMutating(true);
    try {
      if (editingId) {
        await globalCouponApi.update(editingId, form);
        successToast('Cupom atualizado com sucesso!');
      } else {
        await globalCouponApi.create(form);
        successToast('Cupom criado com sucesso!');
      }
      resetForm();
      await invalidate();
    } catch (err) {
      errorToast(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setMutating(false);
    }
  };

  const remove = async (id: string) => {
    setMutating(true);
    try {
      await globalCouponApi.delete(id);
      infoToast('Cupom removido.');
      await invalidate();
    } catch (err) {
      errorToast(err instanceof Error ? err.message : 'Erro ao remover');
    } finally {
      setMutating(false);
    }
  };

  const toggleActive = async (coupon: GlobalCoupon) => {
    setMutating(true);
    try {
      await globalCouponApi.update(coupon.id, { isActive: !coupon.isActive });
      await invalidate();
    } catch (err) {
      errorToast(err instanceof Error ? err.message : 'Erro ao alternar');
    } finally {
      setMutating(false);
    }
  };
  const usagePercent = (c: GlobalCoupon) => Math.round((c.currentUses / c.maxUses) * 100);

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
              <div className="col-span-2">
                <label className="text-xs text-text-secondary font-medium">Descrição</label>
                <input type="text" value={form.description} onChange={(e) => { setForm({ ...form, description: e.target.value }); }}
                  className="w-full h-10 px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus" placeholder="Ex: 30% off em pedidos acima de R$ 50" />
              </div>
              <div>
                <label className="text-xs text-text-secondary font-medium">Tipo</label>
                <select value={form.discountType} onChange={(e) => { setForm({ ...form, discountType: e.target.value as 'percentage' | 'fixed' }); }}
                  className="w-full h-10 px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus">
                  <option value="percentage">Porcentagem</option>
                  <option value="fixed">Valor fixo</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-text-secondary font-medium">Valor</label>
                <input type="number" value={form.discountValue} onChange={(e) => { setForm({ ...form, discountValue: Number(e.target.value) }); }}
                  className="w-full h-10 px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus" min={0} />
              </div>
              <div>
                <label className="text-xs text-text-secondary font-medium">Pedido mínimo (R$)</label>
                <input type="number" value={form.minOrder} onChange={(e) => { setForm({ ...form, minOrder: Number(e.target.value) }); }}
                  className="w-full h-10 px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus" min={0} />
              </div>
              <div>
                <label className="text-xs text-text-secondary font-medium">Usos máximos</label>
                <input type="number" value={form.maxUses} onChange={(e) => { setForm({ ...form, maxUses: Number(e.target.value) }); }}
                  className="w-full h-10 px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus" min={1} />
              </div>
              <div>
                <label className="text-xs text-text-secondary font-medium">Válido de</label>
                <input type="date" value={form.validFrom} onChange={(e) => { setForm({ ...form, validFrom: e.target.value }); }}
                  className="w-full h-10 px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus" />
              </div>
              <div>
                <label className="text-xs text-text-secondary font-medium">Válido até</label>
                <input type="date" value={form.validUntil} onChange={(e) => { setForm({ ...form, validUntil: e.target.value }); }}
                  className="w-full h-10 px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="solid" intent="primary" className="flex-1" loading={mutating} disabled={!form.code.trim() || !form.description.trim()} onClick={save}>Salvar</Button>
              <Button variant="outline" intent="secondary" className="flex-1" onClick={resetForm}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((coupon) => (
          <article key={coupon.id} className={clsx('rounded-xl border bg-surface-elevated p-4 transition-all', coupon.isActive ? 'border-border-default' : 'border-border-disabled opacity-70')}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-lg text-brand-primary">{coupon.code}</span>
                  <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', coupon.isActive ? 'bg-feedback-success/10 text-feedback-success' : 'bg-text-disabled/10 text-text-disabled')}>{coupon.isActive ? 'Ativo' : 'Inativo'}</span>
                </div>
                <p className="text-sm text-text-secondary mt-1">{coupon.description}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-text-tertiary">Desconto</span><span className="font-semibold text-text-primary">{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `R$ ${coupon.discountValue.toFixed(2)}`}</span></div>
              <div className="flex justify-between"><span className="text-text-tertiary">Pedido mín.</span><span className="font-medium text-text-primary">R$ {coupon.minOrder.toFixed(2).replace('.', ',')}</span></div>
              <div className="flex justify-between"><span className="text-text-tertiary">Validade</span><span className="font-medium text-text-primary">{new Date(coupon.validUntil).toLocaleDateString('pt-BR')}</span></div>
              <div className="flex justify-between"><span className="text-text-tertiary">Usos</span><span className="font-medium text-text-primary">{coupon.currentUses}/{coupon.maxUses}</span></div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-surface-background overflow-hidden">
              <div className={clsx('h-full rounded-full', usagePercent(coupon) > 80 ? 'bg-feedback-error' : 'bg-brand-primary')} style={{ width: `${usagePercent(coupon)}%` }} />
            </div>
            <p className="text-xs text-text-tertiary mt-1">{usagePercent(coupon)}% utilizado</p>
            <div className="flex gap-2 mt-4 pt-3 border-t border-border-default">
              <Button variant="outline" intent="secondary" size="sm" className="flex-1" disabled={mutating} onClick={() => { toggleActive(coupon); }}>{coupon.isActive ? 'Pausar' : 'Ativar'}</Button>
              <Button variant="outline" intent="secondary" size="sm" className="flex-1" disabled={mutating} onClick={() => { openEdit(coupon); }}>Editar</Button>
              <button onClick={() => { remove(coupon.id); }} disabled={mutating} className="p-2 rounded-lg hover:bg-surface-background transition-colors disabled:opacity-50" title="Excluir"><Icon name="Trash2" size={16} className="text-text-tertiary hover:text-feedback-error" /></button>
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