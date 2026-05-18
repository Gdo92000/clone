import { clsx } from 'clsx';
import { FxPriceTag } from './FxPriceTag';

export interface FxOrderSummaryProps {
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  total: number;
  className?: string;
}

export function FxOrderSummary({
  subtotal,
  deliveryFee,
  discount = 0,
  total,
  className,
}: FxOrderSummaryProps) {
  return (
    <div className={clsx('p-4 rounded-xl bg-surface-elevated border border-border-default', className)}>
      <h3 className="font-semibold text-text-primary mb-3">Resumo do pedido</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary">Subtotal</span>
          <FxPriceTag price={subtotal} size="sm" />
        </div>

        <div className="flex justify-between">
          <span className="text-text-secondary">Taxa de entrega</span>
          <span className="text-text-secondary">
            {deliveryFee === 0 ? (
              <span className="text-feedback-success font-medium">Grátis</span>
            ) : (
              <FxPriceTag price={deliveryFee} size="sm" />
            )}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between">
            <span className="text-feedback-success">Desconto</span>
            <span className="text-feedback-success font-medium">
              - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(discount)}
            </span>
          </div>
        )}

        <div className="border-t border-border-default pt-2 mt-2">
          <div className="flex justify-between font-semibold">
            <span className="text-text-primary">Total</span>
            <FxPriceTag price={total} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FxOrderSummary;