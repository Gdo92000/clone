import { clsx } from 'clsx';
import type { CartItem } from '../../types';
import { FxQuantitySelector } from './FxQuantitySelector';
import { FxPriceTag } from './FxPriceTag';
import { Icon } from '../ui/Icon';
import { FxImage } from '../ui/FxImage';
import { calculateItemTotal } from '../../useCases/pricingUseCase';

export interface FxCartItemProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  className?: string;
}

export function FxCartItem({
  item,
  onUpdateQuantity,
  onRemove,
  className,
}: FxCartItemProps) {
  const itemTotal = calculateItemTotal(item.price, item.additives, undefined, item.quantity);

  return (
    <div
      className={clsx(
        'flex gap-3 p-3 rounded-xl bg-surface-elevated border border-border-default',
        className
      )}
    >
      <FxImage
        src={item.imageUrl}
        alt={item.name}
        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-text-primary text-sm leading-tight">
            {item.name}
          </h3>
          <button
            onClick={() => { onRemove(item.id); }}
            className="p-1 text-text-tertiary hover:text-feedback-error transition-colors"
            aria-label="Remover item"
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        {item.additives && item.additives.length > 0 && (
          <div className="mt-1">
            {item.additives.map((additive) => (
              <p key={additive.id} className="text-xs text-text-tertiary">
                + {additive.name}
              </p>
            ))}
          </div>
        )}

        <div className="flex items-end justify-between mt-2">
          <FxQuantitySelector
            value={item.quantity}
            onChange={(q) => { onUpdateQuantity(item.id, q); }}
            size="sm"
          />
          <FxPriceTag price={itemTotal} size="sm" />
        </div>
      </div>
    </div>
  );
}

export default FxCartItem;