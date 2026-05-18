import { clsx } from 'clsx';
import type { VariantProps } from 'tailwind-variants';
import { tv } from 'tailwind-variants';
import { Icon } from '../ui/Icon';

const deliveryBadgeVariants = tv({
  base: 'inline-flex items-center gap-1.5 text-sm font-medium rounded-full',
  variants: {
    variant: {
      default: 'bg-surface-elevated text-text-secondary',
      success: 'bg-feedback-success/10 text-feedback-success',
      warning: 'bg-feedback-warning/10 text-feedback-warning',
    },
    size: {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-base',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

export type DeliveryBadgeVariantProps = VariantProps<typeof deliveryBadgeVariants>;

export interface FxDeliveryBadgeProps
  extends DeliveryBadgeVariantProps,
    VariantProps<typeof deliveryBadgeVariants> {
  time?: string;
  fee?: number;
  freeThreshold?: number;
  className?: string;
}

export function FxDeliveryBadge({
  time,
  fee,
  freeThreshold,
  variant,
  size,
  className,
}: FxDeliveryBadgeProps) {
  const formatFee = (value: number) => {
    if (value === 0) return 'Grátis';
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className={clsx(deliveryBadgeVariants({ variant, size }), className)}>
      {time && (
        <span className="flex items-center gap-1">
          <Icon name="Clock" size={16} />
          {time}
        </span>
      )}
      {fee !== undefined && (
        <span
          className={clsx(
            'flex items-center gap-1',
            freeThreshold && fee === 0 && 'text-feedback-success'
          )}
        >
          <Icon name="ShoppingBag" size={16} />
          {formatFee(fee)}
        </span>
      )}
    </div>
  );
}

export default FxDeliveryBadge;