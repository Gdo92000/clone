import { useState, useEffect } from 'react';
import { getAdminCoverageCities } from '../adminData';
import { PageHeader } from '../../../components/ui/PageHeader';

export function AdminCoveragePage() {
  const [cities, setCities] = useState<Awaited<ReturnType<typeof getAdminCoverageCities>>>([]);

  useEffect(() => {
    void getAdminCoverageCities().then(setCities);
  }, []);

  return (
    <><PageHeader title="Cidades atendidas" />
      <section className="rounded-xl border border-border-default bg-surface-elevated p-4">
        <div className="space-y-3">
          {cities.map((coverage) => (
            <article key={coverage.id} className="rounded-lg border border-border-default bg-surface-background p-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-text-primary">
                    {coverage.city}, {coverage.state}
                  </p>
                  <p className="text-sm text-text-secondary">
                    Cidade validada por filiais cadastradas.
                  </p>
                </div>
                <p className="text-sm font-medium text-text-primary">
                  {coverage.activeBranches}/{coverage.totalBranches} filiais cadastradas
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}