import { MerchantLayout } from '../components/MerchantLayout';
import { MerchantStatCard } from '../components/MerchantStatCard';
import { MerchantStatusBadge } from '../components/MerchantStatusBadge';
import { Icon } from '../../../components/ui/Icon';
import { formatCurrency } from '../format';
import { useBranches, useMenuItems, useOrders } from '../../../hooks/useMerchantData';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';

export function MerchantDashboardPage() {
  const { data: branches = [], isLoading: branchesLoading, isError: branchesError } = useBranches();
  const { data: menuItems = [], isLoading: menuItemsLoading, isError: menuItemsError } = useMenuItems();
  const { data: orders = [], isLoading: ordersLoading, isError: ordersError } = useOrders();

  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const activeOrders = orders.filter(
    (order) => !['delivered', 'rejected'].includes(order.status)
  );
  const availableItems = menuItems.filter((item) => item.isAvailable).length;

  return (
    <MerchantLayout title="Visao geral">
      <FxQueryBoundary isLoading={branchesLoading || menuItemsLoading || ordersLoading} isError={branchesError || menuItemsError || ordersError}>
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MerchantStatCard label="Faturamento hoje" value={formatCurrency(revenue)} detail="Mock local" icon={<Icon name="DollarSign" size={24} />} />
         <MerchantStatCard label="Pedidos ativos" value={String(activeOrders.length)} detail="Em preparo ou entrega" icon={<Icon name="ShoppingBag" size={24} />} />
         <MerchantStatCard label="Filiais" value={String(branches.length)} detail="Total cadastradas" icon={<Icon name="Store" size={24} />} />
         <MerchantStatCard label="Itens ativos" value={String(availableItems)} detail={`${menuItems.length} produtos no cardapio`} icon={<Icon name="UtensilsCrossed" size={24} />} />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <h2 className="font-semibold text-text-primary">Pedidos recentes</h2>
           <div className="mt-4 space-y-3">
             {orders.map((order) => (
               <div key={order.id} className="flex items-center justify-between gap-3 rounded-lg border border-border-default p-3">
                <div>
                  <p className="font-semibold text-text-primary">{order.id}</p>
                  <p className="text-sm text-text-secondary">{order.customerName} - {formatCurrency(order.total)}</p>
                </div>
                <MerchantStatusBadge status={order.status} />
              </div>
            ))}
          </div>
        </div>

         <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
           <h2 className="font-semibold text-text-primary">Filiais</h2>
           <div className="mt-4 space-y-3">
             {branches.map((branch) => (
               <div key={branch.id} className="rounded-lg bg-surface-background p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-text-primary">{branch.name}</p>
                </div>
                <p className="mt-1 text-sm text-text-secondary">{branch.city}, {branch.state}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </FxQueryBoundary>
    </MerchantLayout>
  );
}
