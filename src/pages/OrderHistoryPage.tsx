import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { FxPageNavbar } from '../components/navigation/FxPageNavbar';

import { FxPriceTag } from '../components/commerce/FxPriceTag';
import { ROUTES, trackingHref } from '../lib/routes';


interface Order {
  id: string;
  restaurantName: string;
  restaurantImage: string;
  date: string;
  status: 'delivered' | 'cancelled' | 'active';
  total: number;
  items: number;
}

export function OrderHistoryPage() {
  const navigate = useNavigate();
  const orders: Order[] = [];
  const handleOrderClick = (order: Order) => { void navigate(trackingHref(order.id)); };

  return (
    <div className="min-h-screen bg-surface-background">
      <FxPageNavbar title="Meus Pedidos" />

      <main>
        <div className="fx-container py-4 space-y-3">
          {orders.length > 0 ? (
            orders.map((order) => (
              <button
                 key={order.id}
                 onClick={() => { handleOrderClick(order); }}
                 className="w-full text-left p-4 rounded-xl bg-surface-elevated border border-border-default hover:border-border-focus transition-colors"
                 aria-label={`Ver detalhes do pedido ${order.id} - ${order.restaurantName}`}
               >
                <div className="flex gap-3">
                  <img
                    src={order.restaurantImage}
                    alt={order.restaurantName}
                    loading="lazy"
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-text-primary truncate">
                        {order.restaurantName}
                      </h3>
                      <span
                        className={clsx(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          order.status === 'delivered' && 'bg-feedback-success/10 text-feedback-success',
                          order.status === 'cancelled' && 'bg-feedback-error/10 text-feedback-error',
                          order.status === 'active' && 'bg-brand-primary/10 text-brand-primary'
                        )}
                      >
                        {order.status === 'delivered' && 'Entregue'}
                        {order.status === 'cancelled' && 'Cancelado'}
                        {order.status === 'active' && 'Em andamento'}
                      </span>
                    </div>

                    <p className="text-sm text-text-tertiary mb-2">
                      {order.id} • {order.date} • {order.items} {order.items === 1 ? 'item' : 'itens'}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">Total</span>
                      <FxPriceTag price={order.total} size="sm" />
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Nenhum pedido ainda
              </h2>
              <p className="text-text-secondary mb-6">
                Seus pedidos realizados aparecerão aqui
              </p>
              <button
                 onClick={() => { void navigate(ROUTES.RESTAURANTS); }}
                 className="px-6 py-3 bg-brand-primary text-text-inverse rounded-full font-medium hover:bg-brand-primary-hover transition-colors"
                 aria-label="Ver restaurantes para fazer um pedido"
               >
                Ver restaurantes
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default OrderHistoryPage;