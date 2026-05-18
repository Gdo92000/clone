import { formatCurrency } from '../../merchant/format';
import { financeRows } from '../experienceData';
import { ExperienceLayout } from '../components/ExperienceLayout';

export function FinancePage() {
  return (
    <ExperienceLayout title="Financeiro mockado">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {financeRows.map((row) => (
          <article key={row.id} className="rounded-xl border border-border-default bg-surface-elevated p-4">
            <p className="text-sm text-text-secondary">{row.title}</p>
            <p className="mt-2 text-2xl font-bold text-text-primary">{formatCurrency(row.amount)}</p>
            <p className="mt-1 text-sm text-text-secondary">{row.detail}</p>
          </article>
        ))}
      </section>
    </ExperienceLayout>
  );
}
