import { useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { useCommissionPlans, useUpdateCommissionPlan } from '../../../hooks/useSuperadminData';
import { clsx } from 'clsx';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';
import { toast } from 'sonner';

interface CommissionPlan {
  id: string;
  name: string;
  marketplaceFee: number;
  deliveryFee: number;
  paymentFee: number;
  additionalFees: { label: string; percentage: number }[];
}

export function CommissionsPage() {
  const { data: apiPlans = [] } = useCommissionPlans();
  const { mutate: updatePlan } = useUpdateCommissionPlan();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CommissionPlan | null>(null);
  const [saved, setSaved] = useState(false);

  const plans = apiPlans.map(p => ({
    id: p.plan_id,
    name: p.name || (p.plan_id === 'basic' ? 'Básico' : p.plan_id === 'pro' ? 'Profissional' : 'Enterprise'),
    marketplaceFee: Number(p.marketplace_fee),
    deliveryFee: Number(p.delivery_fee),
    paymentFee: Number(p.payment_fee),
    additionalFees: p.additional_fees || [],
  }));

  const saveDefaults = () => {
    setSaved(true);
    setTimeout(() => { setSaved(false); }, 2000);
  };

  const startEdit = (plan: CommissionPlan) => {
    setEditingId(plan.id);
    setEditForm({ ...plan, additionalFees: [...plan.additionalFees] });
  };

  const saveEdit = async () => {
    if (!editForm) return;
    try {
      await updatePlan({
        id: editForm.id,
        data: {
          marketplace_fee: String(editForm.marketplaceFee),
          delivery_fee: String(editForm.deliveryFee),
          payment_fee: String(editForm.paymentFee),
          additional_fees: editForm.additionalFees,
        }
      });
      toast.success('Plano atualizado com sucesso');
      setEditingId(null);
      setEditForm(null);
    } catch {
      toast.error('Erro ao salvar plano');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  return (
    <>
      <PageHeader title="Comissões por plano" actions={<Button variant="solid" intent="primary" size="sm" onClick={saveDefaults}>{saved ? 'Salvo!' : 'Salvar padrão'}</Button>} />
      <FxQueryBoundary isLoading={false} isError={false}>
      <p className="text-sm text-text-secondary mb-4 -mt-3">
        Defina as taxas de comissão cobradas por plano. Valores em percentual (%).
      </p>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {plans.map((plan) => {
          const isEditing = editingId === plan.id;
          const form = isEditing ? editForm! : plan;

          return (
            <article key={plan.id} className={clsx(
              'rounded-xl border bg-surface-elevated p-5 transition-all',
              plan.id === 'enterprise' ? 'border-brand-primary shadow-sm' : 'border-border-default'
            )}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-text-primary text-lg">{form.name}</h3>
                  {plan.id === 'enterprise' && (
                    <span className="text-xs font-medium text-brand-primary">Mais popular</span>
                  )}
                </div>
                <button onClick={() => { if (isEditing) cancelEdit(); else startEdit(plan); }} className="p-2 rounded-lg hover:bg-surface-background transition-colors">
                  <Icon name={isEditing ? 'X' : 'Pencil'} size={18} className="text-text-tertiary" />
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Taxa marketplace', key: 'marketplaceFee' as const },
                  { label: 'Taxa entrega', key: 'deliveryFee' as const },
                  { label: 'Taxa pagamento', key: 'paymentFee' as const },
                ].map((field) => (
                  <div key={field.key} className="flex items-center justify-between py-1">
                    <span className="text-sm text-text-secondary">{field.label}</span>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={form[field.key]}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setEditForm({ ...form, [field.key]: Number(e.target.value) }); }}
                                  className="w-20 h-8 text-right px-2 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm focus:outline-none focus:border-border-focus"
                                  step="0.5"
                                />
                        <span className="text-sm text-text-tertiary">%</span>
                      </div>
                    ) : (
                      <span className="font-medium text-text-primary">{form[field.key]}%</span>
                    )}
                  </div>
                ))}

                {form.additionalFees.map((fee: { label: string; percentage: number }, i: number) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <span className="text-sm text-text-tertiary">{fee.label}</span>
                    <span className="font-medium text-text-primary">{fee.percentage}%</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border-default">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-primary">Total estimado</span>
                    <span className="text-lg font-bold text-brand-primary">
                      {form.marketplaceFee + form.deliveryFee + form.paymentFee + form.additionalFees.reduce((s: number, f: { percentage: number }) => s + f.percentage, 0)}%
                    </span>

                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2 mt-4">
                  <Button variant="solid" intent="primary" size="sm" className="flex-1" onClick={saveEdit}>Salvar</Button>
                  <Button variant="outline" intent="secondary" size="sm" onClick={cancelEdit}>Cancelar</Button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <section className="rounded-xl border border-border-default bg-surface-elevated p-4 mt-6">
        <h2 className="font-semibold text-text-primary mb-2">Como as taxas funcionam</h2>
        <ul className="space-y-2 text-sm text-text-secondary">
          <li className="flex items-start gap-2">
            <Icon name="Info" size={16} className="shrink-0 mt-0.5 text-brand-primary" />
            <span><strong className="text-text-primary">Taxa marketplace:</strong> aplicada sobre o valor total do pedido antes do frete.</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="Info" size={16} className="shrink-0 mt-0.5 text-brand-primary" />
            <span><strong className="text-text-primary">Taxa entrega:</strong> aplicada sobre o valor do frete cobrado do cliente.</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="Info" size={16} className="shrink-0 mt-0.5 text-brand-primary" />
            <span><strong className="text-text-primary">Taxa pagamento:</strong> aplicada sobre o valor total processado.</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="Info" size={16} className="shrink-0 mt-0.5 text-brand-primary" />
            <span><strong className="text-text-primary">Taxas adicionais:</strong> podem ser configuradas por plano (ex: marketing).</span>
          </li>
        </ul>
      </section>
      </FxQueryBoundary>
    </>
  );
}

export default CommissionsPage;