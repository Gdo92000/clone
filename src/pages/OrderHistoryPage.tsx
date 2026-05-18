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

const mockOrders: Order[] = [
  {
    id: 'PED-2024-0847',
    restaurantName: 'Pizza Brescian',
    restaurantImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
    date: '15 Jan 2024',
    status: 'delivered',
    total: 68.70,
    items: 3,
  },
  {
    id: 'PED-2024-0712',
    restaurantName: 'Burger King',
    restaurantImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    date: '12 Jan 2024',
    status: 'delivered',
    total: 45.90,
    items: 2,
  },
  {
    id: 'PED-2024-0655',
    restaurantName: 'China in Box',
    restaurantImage: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop',
    date: '08 Jan 2024',
    status: 'cancelled',
    total: 52.30,
    items: 4,
  },
  {
    id: 'PED-2024-0598',
    restaurantName: 'Sushi House',
    restaurantImage: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
    date: '02 Jan 2024',
    status: 'delivered',
    total: 124.50,
    items: 5,
  },
];

export function OrderHistoryPage() {
  const navigate = useNavigate();
  const handleOrderClick = (order: Order) => { void navigate(trackingHref(order.id)); };

  return (
    <div className="min-h-screen bg-surface-background">
      <FxPageNavbar title="Meus Pedidos" />

      <main>
        <div className="fx-container py-4 space-y-3">
          {mockOrders.length > 0 ? (
            mockOrders.map((order) => (
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
                 onClick={() => navigate(ROUTES.RESTAURANTS)}
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