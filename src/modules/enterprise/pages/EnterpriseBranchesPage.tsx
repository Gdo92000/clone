import { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { useServices } from '../../../infrastructure/ServiceProvider';
import type { DemoCompanyProfile } from '../../../domain';

const statusLabel: Record<string, string> = {
  trial: 'Trial',
  active: 'Ativo',
  past_due: 'Vencido',
  suspended: 'Suspenso',
  cancelled: 'Cancelado',
};

const statusColor: Record<string, string> = {
  trial: 'text-yellow-600 bg-yellow-50',
  active: 'text-green-600 bg-green-50',
  past_due: 'text-orange-600 bg-orange-50',
  suspended: 'text-red-600 bg-red-50',
  cancelled: 'text-gray-600 bg-gray-100',
};

export function EnterpriseBranchesPage() {
  const { enterpriseService } = useServices();
  const [profiles, setProfiles] = useState<DemoCompanyProfile[]>([]);

  useEffect(() => {
    enterpriseService.getDemoData().then((data: { companyProfiles: DemoCompanyProfile[] }) => {
      setProfiles(data.companyProfiles);
    }).catch(() => {});
  }, [enterpriseService]);

  return (
    <>
      <PageHeader title="Unidades Corporativas" />
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {profiles.map((company) => (
          <article key={company.companyId} className="rounded-xl border border-border-default bg-surface-elevated overflow-hidden">
            <div className="h-20 bg-cover bg-center" style={{ backgroundImage: `url(${company.bannerUrl})` }} />
            <div className="flex items-center gap-3 p-4">
              <img
                src={company.logoUrl}
                alt="Logo"
                className="h-12 w-12 rounded-full border-2 border-white -mt-10 bg-white object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold text-text-primary">{company.companyId}</p>
                <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[company.commercialStatus] ?? 'text-gray-600 bg-gray-100'}`}>
                  {statusLabel[company.commercialStatus] ?? company.commercialStatus}
                </span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
