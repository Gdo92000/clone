import { PageHeader } from '../../../components/ui/PageHeader';
import { usePlanLimits } from '../usePlanLimits';

export function EnterprisePlansPage() {
  return (
    <>
      <PageHeader title="Limites e Uso do Plano" />
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <h3 className="font-semibold text-text-primary">Empresa: company-1</h3>
          <PlanUsageCard companyId="company-1" />
        </article>
        <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <h3 className="font-semibold text-text-primary">Empresa: company-2</h3>
          <PlanUsageCard companyId="company-2" />
        </article>
      </section>
    </>
  );
}

function PlanUsageCard({ companyId }: { companyId: string }) {
  const { limits, usage, canAddBranch, canAddProduct, canInviteUser, canCreateCampaign } = usePlanLimits(companyId);

  const metrics = [
    { label: 'Filiais', used: usage.branches, limit: limits.branches, ok: canAddBranch },
    { label: 'Produtos', used: usage.products, limit: limits.products, ok: canAddProduct },
    { label: 'Usuários', used: usage.users, limit: limits.users, ok: canInviteUser },
    { label: 'Campanhas', used: usage.campaigns, limit: limits.campaigns, ok: canCreateCampaign },
  ];

  return (
    <div className="mt-3 space-y-3">
      {metrics.map((m) => (
        <div key={m.label}>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">{m.label}</span>
            <span className="text-text-primary">{m.used} / {m.limit}</span>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-surface-background overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${m.ok ? 'bg-blue-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min((m.used / Math.max(m.limit, 1)) * 100, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
