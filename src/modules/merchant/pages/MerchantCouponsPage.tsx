import { useState, useEffect } from 'react';
import { MerchantLayout } from '../components/MerchantLayout';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { useCoupons } from '../../../hooks/useMerchantData';
import type { MerchantCoupon } from '../../../types';
import { clsx } from 'clsx';

type CouponForm = Omit<MerchantCoupon, 'id' | 'currentUses'>;
const emptyForm: CouponForm = { code: '', description: '', discountType: 'percentage', discountValue: 10, minOrder: 0, maxUses: 100, validUntil: '', isActive: true };

export function MerchantCouponsPage() {
  const { data: initialCoupons = [] } = useCoupons();
  const [coupons, setCoupons] = useState<MerchantCoupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);

    useEffect(() => {
      if (initialCoupons.length > 0) {
        setCoupons(initialCoupons);
      }
    }, [initialCoupons]);

  const resetForm = () => { setForm(emptyForm); setShowForm(false); setEditingId(null); };

  const openNew = () => { setForm({ ...emptyForm, validUntil: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10) }); setShowForm(true); };

  const openEdit = (c: MerchantCoupon) => { setForm({ code: c.code, description: c.description, discountType: c.discountType, discountValue: c.discountValue, minOrder: c.minOrder, maxUses: c.maxUses, validUntil: c.validUntil, isActive: c.isActive }); setEditingId(c.id); setShowForm(true); };

  const save = () => {
    if (!form.code.trim() || !form.description.trim()) return;
    if (editingId) {
      setCoupons((prev) => prev.map((c) => c.id === editingId ? { ...c, ...form } : c));
    } else {
      setCoupons((prev) => [...prev, { ...form, id: `mc${Date.now()}`, currentUses: 0 }]);
    }
    resetForm();
  };

  const remove = (id: string) => { if (confirm('Remover cupom?')) setCoupons((prev) => prev.filter((c) => c.id !== id)); };

  const toggleActive = (id: string) => { setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, isActive: !c.isActive } : c)); };
  const usagePercent = (c: MerchantCoupon) => c.maxUses > 0 ? Math.round((c.currentUses / c.maxUses) * 100) : 0;

  return (
    <MerchantLayout title="Cupons da loja" actions={<Button variant="solid" intent="primary" size="sm" onClick={openNew}>Criar cupom</Button>}>
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">Crie cupons e promoções para sua loja. Eles aparecerão para os clientes no marketplace.</p>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={resetForm}>
            <div className="bg-surface-elevated rounded-2xl border border-border-default shadow-xl w-full max-w-lg mx-4 p-6 space-y-4" onClick={(e) => { e.stopPropagation(); }}>
              <h3 className="font-semibold text-lg text-text-primary">{editingId ? 'Editar cupom' : 'Criar cupom'}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-text-secondary font-medium">Código</label>
                  <input type="text" value={form.code} onChange={(e) => { setForm({ ...form, code: e.target.value.toUpperCase() }); }} className="w-full h-10 px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus" placeholder="Ex: LOJA10" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-text-secondary font-medium">Descrição</label>
                  <input type="text" value={form.description} onChange={(e) => { setForm({ ...form, description: e.target.value }); }} className="w-full h-10 px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus" />
                </div>
                <div>
                  <label className="text-xs text-text-secondary font-medium">Tipo</label>
                  <select value={form.discountType} onChange={(e) => { setForm({ ...form, discountType: e.target.value as 'percentage' | 'fixed' }); }} className="w-full h-10 px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus">
                    <option value="percentage">Porcentagem</option><option value="fixed">Valor fixo</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-secondary font-medium">Valor</label>
                  <input type="number" value={form.discountValue} onChange={(e) => { setForm({ ...form, discountValue: Number(e.target.value) }); }} className="w-full h-10 px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus" min={0} />
                </div>
                <div>
                  <label className="text-xs text-text-secondary font-medium">Pedido mín. (R$)</label>
                  <input type="number" value={form.minOrder} onChange={(e) => { setForm({ ...form, minOrder: Number(e.target.value) }); }} className="w-full h-10 px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus" min={0} />
                </div>
                <div>
                  <label className="text-xs text-text-secondary font-medium">Usos máximos</label>
                  <input type="number" value={form.maxUses} onChange={(e) => { setForm({ ...form, maxUses: Number(e.target.value) }); }} className="w-full h-10 px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus" min={1} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-text-secondary font-medium">Válido até</label>
                  <input type="date" value={form.validUntil} onChange={(e) => { setForm({ ...form, validUntil: e.target.value }); }} className="w-full h-10 px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="solid" intent="primary" className="flex-1" onClick={save} disabled={!form.code.trim() || !form.description.trim()}>Salvar</Button>
                <Button variant="outline" intent="secondary" className="flex-1" onClick={resetForm}>Cancelar</Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {coupons.map((coupon) => (
            <article key={coupon.id} className={clsx('rounded-xl border bg-surface-elevated p-4', coupon.isActive ? 'border-border-default' : 'border-border-disabled opacity-60')}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg text-brand-primary">{coupon.code}</span>
                    <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-medium', coupon.isActive ? 'bg-feedback-success/10 text-feedback-success' : 'bg-text-disabled/10 text-text-disabled')}>{coupon.isActive ? 'Ativo' : 'Pausado'}</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">{coupon.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><p className="text-text-tertiary">Desconto</p><p className="font-semibold text-text-primary">{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `R$ ${coupon.discountValue.toFixed(2)}`}</p></div>
                <div><p className="text-text-tertiary">Pedido mín.</p><p className="font-semibold text-text-primary">R$ {coupon.minOrder.toFixed(2).replace('.', ',')}</p></div>
                <div><p className="text-text-tertiary">Usos</p><p className="font-semibold text-text-primary">{coupon.currentUses}/{coupon.maxUses}</p></div>
                <div><p className="text-text-tertiary">Validade</p><p className="font-semibold text-text-primary">{new Date(coupon.validUntil).toLocaleDateString('pt-BR')}</p></div>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-surface-background overflow-hidden">
                <div className={clsx('h-full rounded-full', usagePercent(coupon) > 80 ? 'bg-feedback-error' : 'bg-brand-primary')} style={{ width: `${usagePercent(coupon)}%` }} />
              </div>
              <p className="text-xs text-text-tertiary mt-1">{usagePercent(coupon)}% utilizado</p>
              <div className="flex gap-2 mt-4 pt-3 border-t border-border-default">
                <Button variant="outline" intent="secondary" size="sm" className="flex-1" onClick={() => { toggleActive(coupon.id); }}>{coupon.isActive ? 'Pausar' : 'Ativar'}</Button>
                <Button variant="outline" intent="secondary" size="sm" className="flex-1" onClick={() => { openEdit(coupon); }}>Editar</Button>
                <button onClick={() => { remove(coupon.id); }} className="p-2 rounded-lg hover:bg-surface-background transition-colors" title="Excluir"><Icon name="Trash2" size={16} className="text-text-tertiary hover:text-feedback-error" /></button>
              </div>
            </article>
          ))}
        </div>

        {coupons.length === 0 && (
          <div className="text-center py-12 rounded-xl border border-border-default bg-surface-elevated">
            <Icon name="Tag" size={40} className="mx-auto text-text-tertiary" />
            <p className="text-text-secondary mt-3">Nenhum cupom criado.</p>
          </div>
        )}
      </div>
    </MerchantLayout>
  );
}

export default MerchantCouponsPage;