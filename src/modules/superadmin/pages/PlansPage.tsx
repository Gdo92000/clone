import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../merchant/format';
import { featureLabels, useSaasWorkspace } from '../../saas';
import type { FeatureKey, PlanId, SaasPlan } from '../../saas';
import { PageHeader } from '../../../components/ui/PageHeader';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';

const featureOptions = Object.entries(featureLabels) as [FeatureKey, string][];

export function PlansPage() {
  const { plans, setPlans } = useSaasWorkspace();
  const [showInactive, setShowInactive] = useState(false);
  const [form, setForm] = useState({
    id: 'basic' as PlanId,
    name: '',
    monthlyPrice: '',
    description: '',
  });

  const toggleFeature = (planId: PlanId, featureKey: FeatureKey) => {
    setPlans((currentPlans) =>
      currentPlans.map((plan) => {
        if (plan.id !== planId) {
          return plan;
        }

        const includedFeatures = plan.includedFeatures.includes(featureKey)
          ? plan.includedFeatures.filter((item) => item !== featureKey)
          : [...plan.includedFeatures, featureKey];

        return { ...plan, includedFeatures };
      })
    );
  };

  const softDeletePlan = (planId: PlanId) => {
    if (confirm(`Arquivar plano "${plans.find((p) => p.id === planId)?.name}"? Ele não ser? mais exibido para novas assinaturas.`)) {
      setPlans((current) => current.map((p) => p.id === planId ? { ...p, name: `${p.name} (arquivado)` } : p));
    }
  };

  const visiblePlans = showInactive ? plans : plans.filter((p) => !p.name.includes('(arquivado)'));

  const upsertPlan = () => {
    const monthlyPrice = Number(form.monthlyPrice.replace(',', '.'));

    if (!form.name.trim() || Number.isNaN(monthlyPrice)) {
      return;
    }

    const nextPlan: SaasPlan = {
      id: form.id,
      name: form.name.trim(),
      monthlyPrice,
      description: form.description.trim(),
      includedFeatures: [],
      limits: { branches: 1, products: 50, users: 2, campaigns: 0 },
    };

    setPlans((currentPlans) => {
      const exists = currentPlans.some((plan) => plan.id === nextPlan.id);
      return exists
        ? currentPlans.map((plan) => (plan.id === nextPlan.id ? { ...plan, ...nextPlan } : plan))
        : [...currentPlans, nextPlan];
    });
  };

  return (
    <>      <PageHeader title="Planos de assinatura" />
      <FxQueryBoundary isLoading={false} isError={false}>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <h2 className="font-semibold text-text-primary">Editar plano</h2>
          <div className="mt-4 space-y-3">
            <select
              value={form.id}
              onChange={(event) => { setForm({ ...form, id: event.target.value as PlanId }); }}
              className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
            >
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>
            <input
              value={form.name}
              onChange={(event) => { setForm({ ...form, name: event.target.value }); }}
              placeholder="Nome comercial"
              className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
            />
            <input
              value={form.monthlyPrice}
              onChange={(event) => { setForm({ ...form, monthlyPrice: event.target.value }); }}
              placeholder="Mensalidade"
              inputMode="decimal"
              className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
            />
            <textarea
              value={form.description}
              onChange={(event) => { setForm({ ...form, description: event.target.value }); }}
              placeholder="Descricao"
              rows={4}
              className="w-full rounded-lg border border-border-default bg-surface-background px-3 py-2 text-sm"
            />
            <Button fullWidth onClick={upsertPlan}>Salvar plano</Button>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary">
            <input type="checkbox" checked={showInactive} onChange={(e) => { setShowInactive(e.target.checked); }}
              className="w-4 h-4 rounded border-border-default text-brand-primary" />
            Mostrar arquivados ({plans.filter((p) => p.name.includes('(arquivado)')).length})
          </label>

          {visiblePlans.map((plan) => (
            <article key={plan.id} className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="font-semibold text-text-primary">{plan.name}</h2>
                  <p className="text-sm text-text-secondary">{plan.description}</p>
                </div>
                  <p className="font-bold text-text-primary">{formatCurrency(plan.monthlyPrice)}/mes</p>
                  {!plan.name.includes('(arquivado)') && (
                    <button onClick={() => { softDeletePlan(plan.id); }} className="p-2 rounded-lg hover:bg-surface-background transition-colors shrink-0" title="Arquivar plano">
                      <svg className="w-4 h-4 text-text-tertiary hover:text-feedback-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 4H3M8 2h8M4 4v15a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V4M10 12v4M14 12v4"/></svg>
                    </button>
                  )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                <span>Filiais: {plan.limits.branches}</span>
                <span>Produtos: {plan.limits.products}</span>
                <span>Usuarios: {plan.limits.users}</span>
                <span>Campanhas: {plan.limits.campaigns}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {featureOptions.map(([featureKey, label]) => {
                  const active = plan.includedFeatures.includes(featureKey);
                  return (
                    <button
                      key={featureKey}
                      type="button"
                      onClick={() => { toggleFeature(plan.id, featureKey); }}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        active ? 'bg-brand-secondary text-text-inverse' : 'bg-surface-background text-text-secondary'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>
      </FxQueryBoundary>
    </>
  );
}

export default PlansPage;