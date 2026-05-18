import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMenuItem } from '../hooks/useRestaurants';
import { FxPriceTag } from '../components/commerce/FxPriceTag';
import { FxQuantitySelector } from '../components/commerce/FxQuantitySelector';
import { FxImage } from '../components/ui/FxImage';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { calculateItemTotal } from '../services/pricingService';
import { successToast } from '../lib/toast';
import { restaurantDetailHref } from '../lib/routes';


export function ItemDetailPage() {
  const { restaurantId: rid, itemId } = useParams<{ restaurantId: string; itemId: string }>();
  const navigate = useNavigate();

  const { data: item } = useMenuItem(itemId);

  const [quantity, setQuantity] = useState(1);
  const [selectedAdditives, setSelectedAdditives] = useState<Set<string>>(new Set());
  const [observations, setObservations] = useState('');

  const totalPrice = useMemo(() => {
    if (!item) return 0;
    return calculateItemTotal(item.price, item.additives, selectedAdditives, quantity);
  }, [item, selectedAdditives, quantity]);

  const toggleAdditive = (additiveId: string) => {
    setSelectedAdditives((prev) => {
      const next = new Set(prev);
      if (next.has(additiveId)) {
        next.delete(additiveId);
      } else {
        next.add(additiveId);
      }
      return next;
    });
  };

  const handleAddToCart = () => {
    successToast(`${item?.name ?? 'Item'} adicionado ao carrinho!`);
    void navigate(rid ? restaurantDetailHref(rid) : '/');
  };

  if (!item) {
    return (
      <div className="min-h-screen bg-surface-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="font-semibold text-xl text-text-primary mb-2">
            Item não encontrado
          </h2>
          <button
              onClick={() => navigate(rid ? restaurantDetailHref(rid) : '/')}
             className="text-brand-primary hover:text-brand-primary-hover"
           >
             Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-background">
      <header className="sticky top-0 z-50 bg-surface-elevated border-b border-border-default">
        <div className="fx-container flex items-center h-14 gap-4">
           <button
              onClick={() => navigate(rid ? restaurantDetailHref(rid) : '/')}
              className="w-10 h-10 rounded-full hover:bg-surface-background flex items-center justify-center"
              aria-label="Voltar"
            >
             <Icon name="ChevronLeft" className="text-text-primary" size={20} />
           </button>
          <span className="font-medium text-text-primary truncate">
            Adicionar ao pedido
          </span>
        </div>
      </header>

      <main className="pb-32">
        <FxImage
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-64 object-cover"
        />

        <div className="fx-container -mt-6">
          <div className="bg-surface-elevated rounded-xl shadow-lg p-6">
            <h1 className="font-display font-bold text-2xl text-text-primary">
              {item.name}
            </h1>
            <p className="text-text-secondary mt-2">{item.description}</p>

            <div className="mt-4">
              <FxPriceTag price={item.price} {...(item.originalPrice !== undefined ? { originalPrice: item.originalPrice } : {})} size="lg" />
            </div>
          </div>
        </div>

        {item.additives && item.additives.length > 0 && (
          <div className="fx-container mt-6">
            <div className="bg-surface-elevated rounded-xl p-6">
              <h3 className="font-semibold text-text-primary mb-4">
                Complementos
              </h3>
              <div className="space-y-3">
                {item.additives.map((additive) => (
                  <label
                    key={additive.id}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedAdditives.has(additive.id)}
                        onChange={() => { toggleAdditive(additive.id); }}
                        className="w-5 h-5 rounded border-border-default text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-text-primary">{additive.name}</span>
                    </div>
                    <span className="text-text-secondary">
                      + R$ {additive.price.toFixed(2).replace('.', ',')}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="fx-container mt-6">
          <div className="bg-surface-elevated rounded-xl p-6">
            <h3 className="font-semibold text-text-primary mb-4">
              Observações
            </h3>
                <label htmlFor="observations" className="text-sm font-medium text-text-secondary">Observações</label>
                  <textarea
                    id="observations"
                    value={observations}
                    onChange={(e) => { setObservations(e.target.value); }}
                    placeholder="Algum pedido especial? Ex: tirar cebola, ponto da carne..."
                    className="w-full h-24 px-4 py-3 rounded-xl bg-surface-background border border-border-default text-text-primary placeholder:text-text-tertiary text-sm resize-none transition-colors focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-brand-primary/20"
                  />
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-surface-elevated border-t border-border-default p-4">
        <div className="fx-container">
          <div className="flex items-center justify-between gap-4">
            <FxQuantitySelector
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={10}
              size="lg"
            />
            <Button
              variant="solid"
              intent="primary"
              size="lg"
              fullWidth
              onClick={handleAddToCart}
              disabled={!item.isAvailable}
            >
              Adicionar • R$ {totalPrice.toFixed(2).replace('.', ',')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetailPage;