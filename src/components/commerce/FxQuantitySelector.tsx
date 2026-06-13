import { clsx } from 'clsx';
import { Icon } from '../ui/Icon';

export interface FxQuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FxQuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  className,
}: FxQuantitySelectorProps) {
  const sizeClasses = {
    sm: 'w-32 h-11 text-sm',
    md: 'w-36 h-11 text-base',
    lg: 'w-40 h-12 text-lg',
  };

  const buttonSizeClasses = {
    sm: 'w-11 h-11 min-w-[44px] min-h-[44px] text-sm',
    md: 'w-11 h-11 min-w-[44px] min-h-[44px] text-base',
    lg: 'w-12 h-12 min-w-[44px] min-h-[44px] text-lg',
  };

  const decrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const increase = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div
      className={clsx(
        'flex items-center justify-between rounded-full border border-border-default bg-surface-elevated',
        sizeClasses[size],
        className
      )}
    >
      <button
        onClick={decrease}
        disabled={value <= min}
        className={clsx(
          'flex items-center justify-center rounded-full border border-border-default bg-surface-elevated transition-colors',
          buttonSizeClasses[size],
          value <= min
            ? 'text-text-disabled cursor-not-allowed'
            : 'hover:bg-surface-background active:bg-border-default'
        )}
        aria-label="Diminuir quantidade"
      >
        <Icon name="Minus" size={16} />
      </button>

      <span className="font-semibold text-text-primary">{value}</span>

      <button
        onClick={increase}
        disabled={value >= max}
        className={clsx(
          'flex items-center justify-center rounded-full transition-colors',
          buttonSizeClasses[size],
          value >= max
            ? 'text-text-disabled cursor-not-allowed bg-surface-elevated'
            : 'bg-brand-primary text-text-inverse hover:bg-brand-primary-hover'
        )}
        aria-label="Aumentar quantidade"
      >
        <Icon name="Plus" size={16} />
      </button>
    </div>
  );
}

export default FxQuantitySelector;