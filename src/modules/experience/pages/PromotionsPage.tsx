import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';
import { ExperienceLayout } from '../components/ExperienceLayout';
import { useGlobalCoupons } from '../../../hooks/useSuperadminData';

export function PromotionsPage() {
  const { data: coupons = [], isLoading, error } = useGlobalCoupons();

  return (
    <ExperienceLayout title="Cupons e promocoes">
      <FxQueryBoundary isLoading={isLoading} isError={!!error} error={error instanceof Error ? error : null}>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {coupons.filter((c: any) => c.isActive).map((coupon: any) => (
          <article key={coupon.id} className="rounded-xl border border-border-default bg-surface-elevated p-4">
            <p className="text-sm font-bold text-brand-primary">{coupon.code}</p>
            <h2 className="mt-2 font-semibold text-text-primary">{coupon.description}</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {coupon.discountType === 'percentage' ? `${coupon.discountValue}% de desconto` : `R$ ${coupon.discountValue.toFixed(2).replace('.', ',')} de desconto`}
              {coupon.minOrder > 0 ? ` | Pedido mínimo: R$ ${coupon.minOrder.toFixed(2).replace('.', ',')}` : ''}
            </p>
          </article>
        ))}
        {coupons.filter((c: any) => c.isActive).length === 0 && (
          <div className="col-span-full text-center py-12 text-text-secondary">
            Nenhum cupom disponível no momento
          </div>
        )}
      </section>
      </FxQueryBoundary>
    </ExperienceLayout>
  );
}
