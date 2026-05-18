import { useState, useEffect } from 'react';
import { getAdminCompanies } from '../adminData';
import { PageHeader } from '../../../components/ui/PageHeader';

export function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Awaited<ReturnType<typeof getAdminCompanies>>>([]);

  useEffect(() => {
    void getAdminCompanies().then(setCompanies);
  }, []);

  return (
    <><PageHeader title="Empresas" />
      <section className="rounded-xl border border-border-default bg-surface-elevated p-4">
        <div className="space-y-3">
          {companies.map((company) => (
            <article key={company.id} className="rounded-lg border border-border-default bg-surface-background p-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-text-primary">{company.name}</p>
                  <p className="text-sm text-text-secondary">{company.document}</p>
                </div>
                <div className="text-sm text-text-secondary md:text-right">
                  <p>{company.branches} filiais</p>
                  <p>Plano {company.plan}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}