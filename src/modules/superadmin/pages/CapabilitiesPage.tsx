import { capabilityCatalog, featureLabels, useSaasWorkspace } from '../../saas';
import { formatCurrency } from '../../merchant/format';
import { PageHeader } from '../../../components/ui/PageHeader';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';

export function CapabilitiesPage() {
  const { addons, subscriptions, plans } = useSaasWorkspace();

  return (
    <>      <PageHeader title="Catalogo de capabilities" />
      <FxQueryBoundary isLoading={false} isError={false}>
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <p className="text-sm text-text-secondary">Capabilities</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{capabilityCatalog.length}</p>
        </article>
        <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <p className="text-sm text-text-secondary">Addons ativos no catalogo</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{addons.length}</p>
        </article>
        <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <p className="text-sm text-text-secondary">Assinaturas monetizadas</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{subscriptions.length}</p>
        </article>
      </section>

      <section className="space-y-3">
        {capabilityCatalog.map((capability) => {
          const plan = plans.find((item) => item.id === capability.requiredPlan);
          return (
            <article key={capability.featureKey} className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-secondary">{capability.category}</p>
                  <h2 className="font-semibold text-text-primary">{capability.name}</h2>
                  <p className="mt-1 text-sm text-text-secondary">{capability.description}</p>
                  <p className="mt-2 text-xs text-text-secondary">
                    Feature key: {capability.featureKey} - Plano minimo: {plan?.name}
                  </p>
                </div>
                <div className="text-left lg:text-right">
                  <p className="font-bold text-text-primary">{formatCurrency(capability.monthlyPrice)}/mes</p>
                  <p className="text-sm text-text-secondary">{capability.chargeType}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {capability.dependencies.length === 0 ? (
                  <span className="rounded-full bg-surface-background px-3 py-1 text-xs font-semibold text-text-secondary">
                    Sem dependencias
                  </span>
                ) : (
                  capability.dependencies.map((dependency) => (
                    <span key={dependency} className="rounded-full bg-surface-background px-3 py-1 text-xs font-semibold text-text-secondary">
                      Depende de {featureLabels[dependency]}
                    </span>
                  ))
                )}
                {capability.relatedLimits.map((limit) => (
                  <span key={limit} className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
                    Limite: {limit}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </section>
      </FxQueryBoundary>
    </>
  );

}

