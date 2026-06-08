import { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';
import { usePlanLimits } from '../usePlanLimits';
import { useAuditLog } from '../useAuditLog';
import { useServices } from '../../../infrastructure/ServiceProvider';
import type { DemoCompanyProfile, DemoProduct, DemoCustomer } from '../../../domain';

export function EnterpriseDashboardPage({ companyId = 'company-1' }: { companyId?: string }) {
  const { enterpriseService } = useServices();
  const { limits, usage, canAddBranch, canAddProduct } = usePlanLimits(companyId);
  const { events } = useAuditLog();
  const [profiles, setProfiles] = useState<DemoCompanyProfile[]>([]);
  const [products, setProducts] = useState<DemoProduct[]>([]);
  const [customers, setCustomers] = useState<DemoCustomer[]>([]);

  useEffect(() => {
    enterpriseService.getDemoData().then((data: { companyProfiles: DemoCompanyProfile[]; products: DemoProduct[]; customers: DemoCustomer[] }) => {
      setProfiles(data.companyProfiles);
      setProducts(data.products);
      setCustomers(data.customers);
    }).catch(() => {});
  }, [enterpriseService]);

  const stats = [
    { label: 'Empresas (demo)', value: String(profiles.length), detail: 'Perfis cadastrados' },
    { label: 'Produtos (demo)', value: String(products.length), detail: 'Itens de cardápio' },
    { label: 'Clientes (demo)', value: String(customers.length), detail: 'Contas demo' },
    { label: 'Eventos de auditoria', value: String(events.length), detail: 'Registros recentes' },
  ];

  return (
    <>
      <PageHeader title="Painel Corporativo" />
      <FxQueryBoundary isLoading={false} isError={false}>
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((card) => (
            <article key={card.label} className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <p className="text-sm text-text-secondary">{card.label}</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">{card.value}</p>
              <p className="mt-1 text-sm text-text-secondary">{card.detail}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-xl border border-border-default bg-surface-elevated p-4">
          <h2 className="font-semibold text-text-primary">Limites do Plano</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-lg bg-surface-background p-3">
              <p className="font-medium text-text-primary">Filiais</p>
              <p className="text-sm text-text-secondary">{usage.branches} / {limits.branches} usadas</p>
              <p className={`text-xs ${canAddBranch ? 'text-green-600' : 'text-red-600'}`}>
                {canAddBranch ? 'Disponível para adicionar' : 'Limite atingido'}
              </p>
            </div>
            <div className="rounded-lg bg-surface-background p-3">
              <p className="font-medium text-text-primary">Produtos</p>
              <p className="text-sm text-text-secondary">{usage.products} / {limits.products} usados</p>
              <p className={`text-xs ${canAddProduct ? 'text-green-600' : 'text-red-600'}`}>
                {canAddProduct ? 'Disponível para adicionar' : 'Limite atingido'}
              </p>
            </div>
          </div>
        </section>
      </FxQueryBoundary>
    </>
  );
}
