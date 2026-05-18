import type { MerchantOrder } from '../../types';

let _cache: ReturnType<typeof buildDeliveries> | undefined;

function buildDeliveries(orders: MerchantOrder[]) {
  return orders
    .filter((order) => order.deliveryType === 'delivery')
    .map((order, index) => ({
      id: `ENT-${1024 - index}`,
      orderId: order.id,
      customerName: order.customerName,
      address: order.customerAddress,
      status: index === 0 ? 'available' : 'in_route',
      earnings: index === 0 ? 8.5 : 10.25,
      distanceKm: index === 0 ? 3.4 : 5.1,
    }));
}

async function ensureLoaded() {
  if (_cache) return;
  if (!__USE_MOCK__) {
    _cache = [];
    return;
  }
  const { merchantOrders } = await import('../merchant/merchantData');
  _cache = buildDeliveries(merchantOrders);
}

export async function getCourierDeliveries() {
  await ensureLoaded();
  return _cache!;
}
