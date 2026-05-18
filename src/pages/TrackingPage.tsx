import { useNavigate } from 'react-router-dom';
import { FxOrderStatus, type OrderStatusStep } from '../components/commerce/FxOrderStatus';
import { FxPriceTag } from '../components/commerce/FxPriceTag';
import { FxPageNavbar } from '../components/navigation/FxPageNavbar';
import { Button } from '../components/ui/Button';
import { useOrderTracking } from '../hooks/useOrderTracking';
import { ROUTES } from '../lib/routes';


const orderSteps: OrderStatusStep[] = [
  { status: 'confirmed', label: 'Pedido confirmado', time: '14:32' },
  { status: 'preparing', label: 'Preparando seu pedido', time: '14:35' },
  { status: 'ready', label: 'Pronto para retirada' },
  { status: 'dispatched', label: 'Saiu para entrega' },
  { status: 'delivered', label: 'Entregue' },
];

const orderItems = [
  { name: 'Pizza Margherita', quantity: 1, price: 45.90 },
  { name: 'Borda Recheada', quantity: 1, price: 8.90 },
  { name: 'Refrigerante Lata 350ml', quantity: 2, price: 11.80 },
];

export function TrackingPage() {
  const navigate = useNavigate();
  const { currentStatus } = useOrderTracking({ steps: orderSteps, pollingInterval: 10000 });
  const [orderId] = [('PED-2024-0001')];
  const [restaurantName] = [('Pizza Brescian')];

  const total = orderItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-surface-background">
      <FxPageNavbar title="Acompanhar Pedido" backTo="/" />
      <main>
        <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
          <div className="text-center">
            <p className="text-sm text-text-secondary mb-1">Pedido</p>
            <p className="text-lg font-bold text-text-primary">{orderId}</p>
            <p className="text-sm text-text-tertiary">{restaurantName}</p>
          </div>

          <FxOrderStatus currentStatus={currentStatus} steps={orderSteps} estimatedTime="35-40 min" />

          <div className="p-4 rounded-xl bg-surface-elevated border border-border-default">
            <h3 className="font-semibold text-text-primary mb-3">Itens do pedido</h3>
            <div className="space-y-2">
              {orderItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-text-secondary">{item.quantity}x {item.name}</span>
                  <FxPriceTag price={item.price} size="sm" />
                </div>
              ))}
            </div>
            <div className="border-t border-border-default mt-3 pt-3 flex justify-between">
              <span className="font-semibold text-text-primary">Total</span>
              <FxPriceTag price={total} />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated border border-border-default">
            <h3 className="font-semibold text-text-primary mb-2">Endereço de entrega</h3>
            <p className="text-sm text-text-secondary">Av. Brasil, 1234 - Centro</p>
            <p className="text-sm text-text-secondary">Franca - SP, 00000-000</p>
          </div>

          {currentStatus === 'dispatched' && (
            <div className="p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                  <span className="text-2xl">{'\u{1F3D7}\uFE0F'}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-text-primary">Seu entregador</p>
                  <p className="text-sm text-text-secondary">Carlos Silva</p>
                </div>
                <Button variant="outline" intent="secondary" size="sm" onClick={() => navigate(ROUTES.SUPPORT)}>Contactar</Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button variant="outline" intent="secondary" className="w-full" onClick={() => navigate('/')}>
              Fazer novo pedido
            </Button>
            <Button variant="ghost" intent="danger" className="w-full" onClick={() => navigate(ROUTES.ORDERS)}>Cancelar pedido</Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TrackingPage;