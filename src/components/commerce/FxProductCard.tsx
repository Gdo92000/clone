import { memo } from 'react';
import type { MenuItem } from '../../types';
import { FxPriceTag } from './FxPriceTag';
import { FxImage } from '../ui/FxImage';
import { Icon } from '../ui/Icon';
import { calculateDiscountPercent } from '../../services/pricingService';

export interface FxProductCardProps {
  item: MenuItem;
  onClick?: () => void;
  onAdd?: () => void;
}

export function FxProductCard({ item, onClick, onAdd }: FxProductCardProps) {
  return (
    <article
      className="group cursor-pointer"
      onClick={onClick}
      onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); } }}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
    >
      <div className="relative rounded-xl overflow-hidden bg-surface-elevated">
        <FxImage
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-40 object-cover transition-transform duration-200 group-hover:scale-105"
        />
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-surface-inverse text-text-inverse text-xs font-medium px-2 py-1 rounded-full">
              Indisponível
            </span>
          </div>
        )}
        {item.originalPrice && (
          <span className="absolute top-2 left-2 bg-feedback-error text-text-inverse text-xs font-bold px-2 py-1 rounded-full">
            -{calculateDiscountPercent(item.originalPrice, item.price)}%
          </span>
        )}
      </div>

      <div className="mt-3">
        <h4 className="font-semibold text-text-primary line-clamp-1">
          {item.name}
        </h4>
        <p className="text-text-secondary text-sm mt-1 line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center justify-between mt-3">
          <FxPriceTag price={item.price} {...(item.originalPrice !== undefined ? { originalPrice: item.originalPrice } : {})} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd?.();
            }}
            disabled={!item.isAvailable}
            className="w-10 h-10 rounded-full bg-brand-primary text-text-inverse flex items-center justify-center transition-all duration-150 hover:bg-brand-primary-hover active:scale-95 disabled:bg-text-disabled disabled:cursor-not-allowed"
            aria-label="Adicionar ao carrinho"
          >
            <Icon name="Plus" size={20} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(FxProductCard);