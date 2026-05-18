import { coupons } from '../experienceData';
import { ExperienceLayout } from '../components/ExperienceLayout';

export function PromotionsPage() {
  return (
    <ExperienceLayout title="Cupons e promocoes">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {coupons.map((coupon) => (
          <article key={coupon.id} className="rounded-xl border border-border-default bg-surface-elevated p-4">
            <p className="text-sm font-bold text-brand-primary">{coupon.id}</p>
            <h2 className="mt-2 font-semibold text-text-primary">{coupon.title}</h2>
            <p className="mt-1 text-sm text-text-secondary">{coupon.detail}</p>
          </article>
        ))}
      </section>
    </ExperienceLayout>
  );
}
