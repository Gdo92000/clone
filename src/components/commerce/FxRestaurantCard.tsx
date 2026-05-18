import { memo } from 'react';
import type { Restaurant } from '../../types';
import { FxDeliveryBadge } from './FxDeliveryBadge';
import { FxImage } from '../ui/FxImage';
import { Icon } from '../ui/Icon';

export interface FxRestaurantCardProps {
  restaurant: Restaurant;
  variant?: 'default' | 'featured' | 'compact';
  showRealDistance?: boolean;
  distanceKm?: number;
  isOpen?: boolean;
  onClick?: () => void;
}

export function FxRestaurantCard({
  restaurant,
  variant = 'default',
  showRealDistance = false,
  distanceKm,
  isOpen,
  onClick,
}: FxRestaurantCardProps) {
  const isFeatured = variant === 'featured';
  const isCompact = variant === 'compact';

  const displayDistance = showRealDistance && distanceKm !== undefined
    ? `${distanceKm.toFixed(1)} km`
    : restaurant.distance;

  return (
    <article
      onClick={onClick}
      onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); } }}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      className={`
        group cursor-pointer rounded-xl bg-surface-elevated overflow-hidden
        transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5
        ${isFeatured ? 'border-2 border-brand-primary' : 'border border-border-default'}
      `}
    >
      <div className="relative">
        <FxImage
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className={`
            w-full object-cover
            ${isCompact ? 'h-32' : 'h-40 sm:h-48'}
          `}
        />
        {restaurant.promotionalOffer && (
          <span className={`absolute top-2 ${isOpen === true ? 'left-14' : 'left-2'} bg-brand-secondary text-text-inverse text-xs font-bold px-2 py-1 rounded-md`}>
            {restaurant.promotionalOffer}
          </span>
        )}
        {isOpen === true && (
          <span className="absolute top-2 left-2 bg-feedback-success text-text-inverse text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Aberto
          </span>
        )}
        {isOpen === false && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-surface-inverse text-text-inverse text-sm font-medium px-3 py-1.5 rounded-full">
              Fechado
            </span>
          </div>
        )}
        {isFeatured && (
          <span className="absolute top-2 right-2 bg-brand-primary text-text-inverse text-xs font-bold px-2 py-1 rounded-md">
            Destaque
          </span>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-text-primary line-clamp-1">
            {restaurant.name}
          </h3>
          <div className="flex items-center gap-1 bg-feedback-success/10 text-feedback-success text-sm font-medium px-2 py-0.5 rounded-full shrink-0">
            <Icon name="Star" size={14} />
            {restaurant.rating}
          </div>
        </div>

        <p className="text-text-secondary text-sm mt-1 line-clamp-1">
          {restaurant.cuisine}
        </p>

        <div className="flex items-center gap-3 mt-2 text-sm text-text-secondary">
          <FxDeliveryBadge time={restaurant.deliveryTime} size="sm" />
          <span className="flex items-center gap-1">
            <Icon name="MapPin" size={16} />
            {displayDistance}
          </span>
        </div>

        {!isCompact && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-default">
            <span className="text-text-secondary text-sm">
              {restaurant.reviewCount.toLocaleString('pt-BR')} avaliações
            </span>
            <span className="text-brand-primary font-semibold text-sm">
              {restaurant.deliveryFee === 0
                ? 'Frete grátis'
                : `Frete R$ ${restaurant.deliveryFee.toFixed(2).replace('.', ',')}`}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

export default memo(FxRestaurantCard);