import { useState, useMemo } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useBranches } from '../../../hooks/useMerchantData';
import { useCouponsByBranch, useSaveCoupon, useToggleCoupon, useDeleteCoupon } from '../../../hooks/useMerchantCoupons';
import { clsx } from 'clsx';

interface MerchantCoupon {
  id: string;
  branch_id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  min_order: string;
  max_uses: number;
  current_uses: number;
  valid_until: string;
  is_active: boolean;
  rules: Record<string, unknown>;
}

type CouponForm = Omit<MerchantCoupon, 'id' | 'current_uses'> & { branch_id?: string };
const emptyForm: CouponForm = { branch_id: '', code: '', description: '', discount_type: 'percentage', discount_value: '10', min_order: '0', max_uses: 100, valid_until: '', is_active: true, rules: {} };

export function MerchantCouponsPage() {
  const { data: branches = [] } = useBranches();
  const [branchId, setBranchId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);

  const effectiveBranchId = useMemo(() => branchId || (branches[0]?.id ?? ''), [branchId, branches]);

  const { data: coupons = [] } = useCouponsByBranch(effectiveBranchId);

  const mutation = useSaveCoupon(editingId, effectiveBranchId);

  const toggleMutation = useToggleCoupon(effectiveBranchId);

  const deleteMutation = useDeleteCoupon(effectiveBranchId);

  const resetForm = () => { setForm(emptyForm); setShowForm(false); setEditingId(null); };

const openNew = () => {
  setForm({ ...emptyForm, valid_until: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10) });
  setShowForm(true);
};

const openEdit = (c: MerchantCoupon) => {
  setForm({
    branch_id: c.branch_id,
    code: c.code,
    description: c.description,
    discount_type: c.discount_type,
    discount_value: c.discount_value,
    min_order: c.min_order,
    max_uses: c.max_uses,
    valid_until: c.valid_until,
    is_active: c.is_active,
    rules: c.rules
  });
  setEditingId(c.id);
  setShowForm(true);
};

  const save = () => {
    if (!form.code.trim() || !form.description.trim()) return;
    mutation.mutate({
      branch_id: effectiveBranchId,
      code: form.code,
      description: form.description,
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      min_order: form.min_order,
      max_uses: form.max_uses,
      valid_until: form.valid_until,
      is_active: form.is_active,
      rules: form.rules,
    }, { onSuccess: resetForm });
  };

  const toggleActive = (id: string, currentStatus: boolean) => {
    toggleMutation.mutate({ id, is_active: !currentStatus });
  };

  const usagePercent = (c: MerchantCoupon) => c.max_uses > 0 ? Math.round((c.current_uses / c.max_uses) * 100) : 0;

  return (
    <>
      <PageHeader title="Cupons da loja" actions={
        <div className="flex gap-3">
          <select
            value={branchId}
            onChange={(e) => { setBranchId(e.target.value); }}
            className="h-10 rounded-lg border border-border-default bg-surface-background px-3 text-sm"
          >
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <Button variant="solid" intent="primary" size="sm" onClick={openNew}>Criar cupom</Button>
        </div>
      } />
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">Crie cupons e promoções para sua loja. Eles aparecerão para os clientes no marketplace.</p>

        <Modal
          isOpen={showForm}
          onClose={resetForm}
          title={editingId ? 'Editar cupom' : 'Criar cupom'}
          size="lg"
          footer={
            <div className="flex gap-2">
              <Button variant="solid" intent="primary" className="flex-1" onClick={save} disabled={!form.code.trim() || !form.description.trim()} loading={mutation.isPending}>Salvar</Button>
              <Button variant="outline" intent="secondary" className="flex-1" onClick={resetForm}>Cancelar</Button>
            </div>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-text-secondary font-medium block">
                Código
                <input type="text" value={form.code} onChange={(e) => { setForm({ ...form, code: e.target.value.toUpperCase() }); }} className="w-full h-11 min-h-[44px] px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2" placeholder="Ex: LOJA10" autoCapitalize="characters" />
              </label>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-text-secondary font-medium block">
                Descrição
                <input type="text" value={form.description} onChange={(e) => { setForm({ ...form, description: e.target.value }); }} className="w-full h-11 min-h-[44px] px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2" />
              </label>
            </div>
            <div>
              <label className="text-xs text-text-secondary font-medium block">
                Tipo
                <select value={form.discount_type} onChange={(e) => { setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' }); }} className="w-full h-11 min-h-[44px] px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2">
                  <option value="percentage">Porcentagem</option>
                  <option value="fixed">Valor fixo</option>
                </select>
              </label>
            </div>
            <div>
              <label className="text-xs text-text-secondary font-medium block">
                Valor
                <input type="number" inputMode="decimal" value={form.discount_value} onChange={(e) => { setForm({ ...form, discount_value: e.target.value }); }} className="w-full h-11 min-h-[44px] px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2" min={0} step="0.01" />
              </label>
            </div>
            <div>
              <label className="text-xs text-text-secondary font-medium block">
                Pedido mín. (R$)
                <input type="number" inputMode="decimal" value={form.min_order} onChange={(e) => { setForm({ ...form, min_order: e.target.value }); }} className="w-full h-11 min-h-[44px] px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2" min={0} step="0.01" />
              </label>
            </div>
            <div>
              <label className="text-xs text-text-secondary font-medium block">
                Usos máximos
                <input type="number" inputMode="numeric" value={form.max_uses} onChange={(e) => { setForm({ ...form, max_uses: Number(e.target.value) }); }} className="w-full h-11 min-h-[44px] px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2" min={1} />
              </label>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-text-secondary font-medium block">
                Válido até
                <input type="date" value={form.valid_until} onChange={(e) => { setForm({ ...form, valid_until: e.target.value }); }} className="w-full h-11 min-h-[44px] px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2" />
              </label>
            </div>
          </div>
        </Modal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {coupons.map((coupon: MerchantCoupon) => (
            <article key={coupon.id} className={clsx('rounded-xl border bg-surface-elevated p-4', coupon.is_active ? 'border-border-default' : 'border-border-disabled opacity-60')}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg text-brand-primary">{coupon.code}</span>
                    <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-medium', coupon.is_active ? 'bg-feedback-success/10 text-feedback-success' : 'bg-text-disabled/10 text-text-disabled')}>{coupon.is_active ? 'Ativo' : 'Pausado'}</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">{coupon.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><p className="text-text-tertiary">Desconto</p><p className="font-semibold text-text-primary">{coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `R$ ${coupon.discount_value}`}</p></div>
                <div><p className="text-text-tertiary">Pedido mín.</p><p className="font-semibold text-text-primary">R$ {coupon.min_order}</p></div>
                <div><p className="text-text-tertiary">Usos</p><p className="font-semibold text-text-primary">{coupon.current_uses}/{coupon.max_uses}</p></div>
                <div><p className="text-text-tertiary">Validade</p><p className="font-semibold text-text-primary">{new Date(coupon.valid_until).toLocaleDateString('pt-BR')}</p></div>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-surface-background overflow-hidden">
                <div className={clsx('h-full rounded-full', usagePercent(coupon) > 80 ? 'bg-feedback-error' : 'bg-brand-primary')} style={{ width: `${usagePercent(coupon)}%` }} />
              </div>
              <p className="text-xs text-text-tertiary mt-1">{usagePercent(coupon)}% utilizado</p>
              <div className="flex gap-2 mt-4 pt-3 border-t border-border-default">
                <Button variant="outline" intent="secondary" size="sm" className="flex-1" onClick={() => { toggleActive(coupon.id, coupon.is_active); }}>{coupon.is_active ? 'Pausar' : 'Ativar'}</Button>
                <Button variant="outline" intent="secondary" size="sm" className="flex-1" onClick={() => { openEdit(coupon); }}>Editar</Button>
                <button onClick={() => { deleteMutation.mutate(coupon.id); }} className="p-2 rounded-lg hover:bg-surface-background transition-colors" title="Excluir"><Icon name="Trash2" size={16} className="text-text-tertiary hover:text-feedback-error" /></button>
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
    </>
  );
}

export default MerchantCouponsPage;
