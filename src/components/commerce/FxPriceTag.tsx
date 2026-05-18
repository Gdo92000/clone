import { clsx } from 'clsx';

export interface FxPriceTagProps {
  price: number;
  originalPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FxPriceTag({
  price,
  originalPrice,
  size = 'md',
  className,
}: FxPriceTagProps) {
  const formatPrice = (value: number) =>
    `R$ ${value.toFixed(2).replace('.', ',')}`;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const originalSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <span
        className={clsx(
          'font-bold text-brand-primary',
          sizeClasses[size]
        )}
      >
        {formatPrice(price)}
      </span>
      {originalPrice && originalPrice > price && (
        <span
          className={clsx(
            'text-text-tertiary line-through',
            originalSizeClasses[size]
          )}
        >
          {formatPrice(originalPrice)}
        </span>
      )}
    </div>
  );
}

export default FxPriceTag;