import type { GlobalCouponDTO } from '../../../dto/superadminDto';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';
import { ExperienceLayout } from '../components/ExperienceLayout';
import { useGlobalCoupons } from '../../../hooks/useSuperadminData';

function isActiveGlobalCoupon(c: GlobalCouponDTO): boolean {
  return c.active;
}

export function PromotionsPage() {
  const { data: coupons = [], isLoading, error } = useGlobalCoupons();

  return (
    <ExperienceLayout title="Cupons e promocoes">
      <FxQueryBoundary isLoading={isLoading} isError={!!error} error={error instanceof Error ? error : null}>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {coupons.filter(isActiveGlobalCoupon).map((coupon) => (
          <article key={coupon.id} className="rounded-xl border border-border-default bg-surface-elevated p-4">
            <p className="text-sm font-bold text-brand-primary">{coupon.code}</p>
            <h2 className="mt-2 font-semibold text-text-primary">{coupon.description ?? `Desconto no pedido`}</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {coupon.discount_type === 'percentage' ? `${coupon.discount}% de desconto` : `R$ ${coupon.discount.toFixed(2).replace('.', ',')} de desconto`}
              {coupon.min_order > 0 ? ` | Pedido mínimo: R$ ${coupon.min_order.toFixed(2).replace('.', ',')}` : ''}
            </p>
          </article>
        ))}
        {coupons.filter(isActiveGlobalCoupon).length === 0 && (
          <div className="col-span-full text-center py-12 text-text-secondary">
            Nenhum cupom disponível no momento
          </div>
        )}
      </section>
      </FxQueryBoundary>
    </ExperienceLayout>
  );
}
