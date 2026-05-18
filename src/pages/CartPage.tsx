import { useNavigate } from 'react-router-dom';
import { FxCartItem } from '../components/commerce/FxCartItem';
import { FxOrderSummary } from '../components/commerce/FxOrderSummary';
import { FxPageNavbar } from '../components/navigation/FxPageNavbar';
import { Button } from '../components/ui/Button';
import { useCart } from '../hooks/useCart';
import { ROUTES } from '../lib/routes';


export function CartPage() {
  const navigate = useNavigate();
  const { items, subtotal, deliveryFee, discount, total, itemsCount, updateQuantity, removeItem } = useCart();

  const handleCheckout = () => {
    void navigate(ROUTES.CHECKOUT);
  };

  return (
    <div className="min-h-screen bg-surface-background">
      <FxPageNavbar title="Sacola" backTo="/" />

      <main className="pb-28">
        <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Sua sacola está vazia
              </h2>
              <p className="text-text-secondary mb-6">
                Adicione itens de um restaurante para começar
              </p>
                <Button
                  variant="solid"
                  intent="primary"
                  size="lg"
                  onClick={() => navigate(ROUTES.RESTAURANTS)}
                  aria-label="Ver restaurantes para adicionar itens"
                >
                  Ver restaurantes
                </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-surface-background overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&h=100&fit=crop"
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="font-semibold text-text-primary">
                      Pizza Brescian
                    </h2>
                    <p className="text-sm text-text-secondary">
                      {itemsCount} {itemsCount === 1 ? 'item' : 'itens'}
                    </p>
                  </div>
                </div>
              </div>

              {items.map((item) => (
                <FxCartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}

              <FxOrderSummary
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                discount={discount}
                total={total}
              />

              <div className="space-y-3">
                <Button
                  variant="outline"
                  intent="secondary"
                  className="w-full"
                  onClick={() => navigate(ROUTES.RESTAURANTS)}
                  aria-label="Adicionar mais itens ao carrinho"
                >
                  Adicionar mais itens
                </Button>

                <Button
                  variant="solid"
                  intent="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleCheckout}
                  aria-label="Continuar para entrega e finalizar pedido"
                >
                  Continuar para entrega
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default CartPage;