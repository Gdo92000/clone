import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useRestaurant, useMenuItems } from '../hooks/useRestaurants';
import type { MenuItem } from '../types';
import { FxProductCard } from '../components/commerce/FxProductCard';
import { FxDeliveryBadge } from '../components/commerce/FxDeliveryBadge';
import { FxImage } from '../components/ui/FxImage';
import { FxQueryBoundary } from '../components/ui/FxQueryBoundary';
import { Icon } from '../components/ui/Icon';
import { successToast } from '../lib/toast';
import { ROUTES, restaurantItemHref } from '../lib/routes';
import { useBranchStatus, useTodayPeriods } from '../hooks/useOperations';

function getStatusLabel(status: { isOpen: boolean; overrideLabel: string | null; reason?: string } | null | undefined): string | null {
  if (!status) return null;
  if (status.isOpen) return 'Aberto agora';
  if (status.overrideLabel) return status.overrideLabel;
  if (status.reason === 'holiday') return 'Fechado - Feriado';
  if (status.reason === 'special_closed') return 'Fechado - Data especial';
  return 'Fechado';
}

function StatusBadge({ status, loading }: { status: { isOpen: boolean; nextOpening: { openTime: string; closeTime: string } | null; nextOpeningDate: string | null; overrideLabel: string | null; reason: string } | null | undefined; loading: boolean }) {
  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full bg-surface-background text-text-tertiary">
        <span className="w-2 h-2 rounded-full bg-text-tertiary" />
        Carregando...
      </span>
    );
  }

  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full bg-surface-background text-text-tertiary">
        <span className="w-2 h-2 rounded-full bg-text-tertiary" />
        Indisponivel
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full ${status.isOpen ? 'bg-feedback-success/10 text-feedback-success' : 'bg-feedback-error/10 text-feedback-error'}`}>
      <span className={`w-2 h-2 rounded-full ${status.isOpen ? 'bg-feedback-success animate-pulse' : 'bg-feedback-error'}`} />
      {getStatusLabel(status)}
    </span>
  );
}

interface Review {
  id: string;
  userName: string;
  userInitials: string;
  rating: number;
  date: string;
  comment: string;
  itemsOrdered: string[];
}

const reviews: Review[] = [];

export function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const cartItemCount = 2;

  const { data: restaurant } = useRestaurant(id);
  const { data: menuItems = [], isLoading: menuItemsLoading, error: menuItemsError } = useMenuItems(id);
  const { data: openStatus, isLoading: statusLoading } = useBranchStatus(restaurant?.id);
  const { data: todayPeriods } = useTodayPeriods(restaurant?.id);

  const restaurantMenuItems = useMemo(() => {
    let items = menuItems.filter((item) => item.restaurantId === id);
    if (selectedCategory) {
      items = items.filter((item) => item.category === selectedCategory);
    }
    return items;
  }, [id, selectedCategory, menuItems]);

  const categories = useMemo(() => {
    const cats = new Set(
      menuItems.filter((item) => item.restaurantId === id).map((item) => item.category)
    );
    return Array.from(cats);
  }, [id, menuItems]);

  const handleProductClick = (item: MenuItem) => {
    if (!id) return;
    void navigate(restaurantItemHref(id, item.id));
  };

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-surface-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="SearchX" className="mx-auto text-text-tertiary" size={48} />
          <h2 className="font-semibold text-xl text-text-primary mt-4 mb-2">Restaurante não encontrado</h2>
          <button onClick={() => { void navigate('/'); }} className="text-brand-primary hover:text-brand-primary-hover font-medium">
            Voltar para home
          </button>
        </div>
      </div>
    );
  }

  return (
    <FxQueryBoundary isLoading={menuItemsLoading} isError={!!menuItemsError} error={menuItemsError}>
    <div className="min-h-screen bg-surface-background pb-40 md:pb-24">
      <div className="relative">
        <FxImage src={restaurant.bannerUrl} alt={restaurant.name} className="w-full h-48 sm:h-56 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <button
             onClick={() => void (window.history.length > 1 ? navigate(-1) : navigate('/'))}
             className="absolute top-4 left-4 w-10 h-10 rounded-full bg-surface-elevated/90 backdrop-blur flex items-center justify-center"
             aria-label="Voltar"
           >
          <Icon name="ChevronLeft" className="text-text-primary" size={20} />
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 -mt-6 relative">
        <div className="bg-surface-elevated rounded-2xl shadow-lg p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-2xl text-text-primary truncate">{restaurant.name}</h1>
                {restaurant.rating >= 4.7 && (
                  <Icon name="Award" className="text-brand-primary shrink-0" size={20} fill="currentColor" />
                )}
              </div>
              <p className="text-text-secondary text-sm mt-0.5">{restaurant.cuisine}</p>
            </div>
            <div className="flex items-center gap-1 bg-feedback-success/10 text-feedback-success text-sm font-medium px-3 py-1.5 rounded-full shrink-0">
              <Icon name="Star" size={16} fill="currentColor" />
              {restaurant.rating}
              <span className="text-text-secondary font-normal ml-0.5">
                ({restaurant.reviewCount.toLocaleString('pt-BR')})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border-default text-sm text-text-secondary flex-wrap">
            <FxDeliveryBadge time={restaurant.deliveryTime} size="sm" />
            <span className="w-1 h-1 rounded-full bg-border-default" />
            <span className="flex items-center gap-1">
              <Icon name="MapPin" size={14} />
              {restaurant.distance}
            </span>
            <span className="w-1 h-1 rounded-full bg-border-default" />
            <span className={restaurant.deliveryFee === 0 ? 'text-feedback-success font-medium' : ''}>
              {restaurant.deliveryFee === 0 ? 'Frete grátis' : `Frete R$ ${restaurant.deliveryFee.toFixed(2).replace('.', ',')}`}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-3 text-xs text-text-tertiary">
            <span className="flex items-center gap-1">
              <Icon name="DollarSign" size={14} />
              Pedido mín. R$ 25,00
            </span>
            <span className="flex items-center gap-1">
              <Icon name="Clock" size={14} />
              Delivery 30-50 min
            </span>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <StatusBadge status={openStatus} loading={statusLoading} />
            {todayPeriods && todayPeriods.length > 0 && (
              <span className="text-xs text-text-secondary">
                {todayPeriods.map((p) => `${p.openTime}-${p.closeTime}`).join(', ')}
              </span>
            )}
            {openStatus?.nextOpening && !openStatus.isOpen && (
              <span className="text-xs text-text-tertiary">
                Abre {openStatus.nextOpeningDate ? `em ${openStatus.nextOpeningDate}` : ''} às {openStatus.nextOpening.openTime}
              </span>
            )}
          </div>

          <button
            onClick={() => { setShowInfo(!showInfo); }}
            className="mt-4 flex items-center gap-1 text-sm font-medium text-brand-primary hover:text-brand-primary-hover transition-colors"
          >
            <Icon name="Info" size={16} />
            {showInfo ? 'Menos informações' : 'Mais informações'}
            <Icon name={showInfo ? 'ChevronUp' : 'ChevronDown'} size={16} />
          </button>

{showInfo && (
             <div className="mt-3 p-4 bg-surface-background rounded-xl text-sm space-y-2 text-text-secondary">
               {restaurant.address && (
                 <p><span className="font-medium text-text-primary">Endereço:</span> {restaurant.address}</p>
               )}
               {restaurant.phone && (
                 <p><span className="font-medium text-text-primary">Telefone:</span> {restaurant.phone}</p>
               )}
            {todayPeriods && todayPeriods.length > 0 && (
              <p><span className="font-medium text-text-primary">Horário de hoje:</span> {todayPeriods.map((p) => `${p.openTime}-${p.closeTime}`).join(', ')}</p>
            )}
               {restaurant.paymentMethods && (
                 <p><span className="font-medium text-text-primary">Pagamento:</span> {restaurant.paymentMethods}</p>
               )}
               <p className="flex items-center gap-1">
                 <span className="font-medium text-text-primary">Cidade:</span> {restaurant.city}
                 {restaurant.neighborhood && <span>, {restaurant.neighborhood}</span>}
               </p>
             </div>
           )}
        </div>

        <div className="mt-6">
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-4 snap-x snap-mandatory scroll-pl-4 scrollbar-hide">
            <button
              onClick={() => { setSelectedCategory(null); }}
              className={clsx(
                'shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                !selectedCategory
                  ? 'bg-brand-primary text-text-inverse'
                  : 'bg-surface-elevated border border-border-default text-text-secondary hover:border-brand-primary'
              )}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => { setSelectedCategory(category); }}
                className={clsx(
                  'shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                  selectedCategory === category
                    ? 'bg-brand-primary text-text-inverse'
                    : 'bg-surface-elevated border border-border-default text-text-secondary hover:border-brand-primary'
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {restaurantMenuItems.length === 0 ? (
            <div className="text-center py-12 bg-surface-elevated rounded-2xl border border-border-default">
              <Icon name="SearchX" className="mx-auto text-text-tertiary" size={36} />
              <p className="text-text-secondary mt-3">Nenhum item disponível nesta categoria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {restaurantMenuItems.map((item) => (
                <FxProductCard key={item.id} item={item} onClick={() => { handleProductClick(item); }} onAdd={() => { successToast(`${item.name} adicionado ao carrinho!`); }} />
              ))}
            </div>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg text-text-primary">Avaliações</h2>
            <button onClick={() => { void navigate(ROUTES.REVIEWS); }} className="text-sm font-medium text-brand-primary hover:text-brand-primary-hover transition-colors">
                 Ver todas ({reviews.length})
               </button>
            </div>

            <div className="flex items-center gap-4 mb-6 p-4 bg-surface-elevated rounded-xl border border-border-default">
              <div className="text-center">
                <div className="text-3xl font-bold text-text-primary">{restaurant.rating}</div>
                <div className="flex items-center gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon key={i} name="Star" size={14} className={i < Math.round(restaurant.rating) ? 'text-feedback-warning' : 'text-text-tertiary'} fill={i < Math.round(restaurant.rating) ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <div className="text-xs text-text-tertiary mt-1">{restaurant.reviewCount.toLocaleString('pt-BR')} avaliações</div>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 rounded-xl bg-surface-elevated border border-border-default">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-secondary flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-text-inverse">{review.userInitials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-medium text-text-primary">{review.userName}</span>
                        <span className="text-xs text-text-tertiary">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-0.5 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Icon key={i} name="Star" size={14} className={i < review.rating ? 'text-feedback-warning' : 'text-text-tertiary'} fill={i < review.rating ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                      <p className="text-text-secondary text-sm">{review.comment}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {review.itemsOrdered.map((item) => (
                          <span key={item} className="px-2 py-0.5 rounded-full bg-surface-background text-text-tertiary text-xs">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-[72px] left-0 right-0 z-40 bg-surface-elevated border-t border-border-default px-4 py-3 md:bottom-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary">Sacola</p>
            <p className="font-bold text-text-primary">{cartItemCount} itens</p>
          </div>
          <button
            onClick={() => { void navigate(ROUTES.CART); }}
            className="flex items-center gap-2 bg-brand-primary text-text-inverse font-semibold px-6 py-3 rounded-full hover:bg-brand-primary-hover transition-all active:scale-95"
          >
            <span>Ver sacola</span>
            <Icon name="ArrowRight" size={18} />
          </button>
        </div>
      </div>
    </div>
    </FxQueryBoundary>
  );
}

export default RestaurantDetailPage;