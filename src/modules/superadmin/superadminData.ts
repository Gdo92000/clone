export interface CommissionPlan {
  id: string;
  name: string;
  marketplaceFee: number;
  deliveryFee: number;
  paymentFee: number;
  additionalFees: { label: string; percentage: number }[];
}

export const commissionPlans: CommissionPlan[] = [
  { id: 'basic', name: 'Básico', marketplaceFee: 12, deliveryFee: 8, paymentFee: 3.5, additionalFees: [{ label: 'Marketing', percentage: 2 }] },
  { id: 'pro', name: 'Profissional', marketplaceFee: 8, deliveryFee: 5, paymentFee: 2.5, additionalFees: [{ label: 'Marketing', percentage: 1.5 }] },
  { id: 'enterprise', name: 'Enterprise', marketplaceFee: 5, deliveryFee: 3, paymentFee: 1.5, additionalFees: [] },
];

export interface GlobalCoupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
  maxUses: number;
  currentUses: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export const globalCoupons: GlobalCoupon[] = [
  { id: 'c1', code: 'BEMVINDO', description: 'Primeira compra ganha frete grátis', discountType: 'fixed', discountValue: 0, minOrder: 25, maxUses: 1000, currentUses: 342, validFrom: '2026-01-01', validUntil: '2026-12-31', isActive: true },
  { id: 'c2', code: 'FRETEGRATIS', description: 'Frete grátis em pedidos acima de R$ 50', discountType: 'fixed', discountValue: 0, minOrder: 50, maxUses: 500, currentUses: 89, validFrom: '2026-03-01', validUntil: '2026-06-30', isActive: true },
  { id: 'c3', code: 'PROMO15', description: '15% de desconto em qualquer pedido', discountType: 'percentage', discountValue: 15, minOrder: 30, maxUses: 2000, currentUses: 1204, validFrom: '2026-02-01', validUntil: '2026-05-31', isActive: true },
  { id: 'c4', code: 'VIP10', description: '10% off para clientes VIP', discountType: 'percentage', discountValue: 10, minOrder: 0, maxUses: 300, currentUses: 45, validFrom: '2026-04-01', validUntil: '2026-07-31', isActive: false },
  { id: 'c5', code: 'PIZZA5', description: 'R$ 5 de desconto em pizzas', discountType: 'fixed', discountValue: 5, minOrder: 20, maxUses: 1500, currentUses: 678, validFrom: '2026-01-15', validUntil: '2026-08-15', isActive: true },
];

export interface FoodCategory {
  id: string;
  name: string;
  icon: string;
  slug: string;
  storeCount: number;
  isActive: boolean;
}

export const foodCategories: FoodCategory[] = [
  { id: 'cat1', name: 'Pizza', icon: '\u{1F355}', slug: 'pizza', storeCount: 28, isActive: true },
  { id: 'cat2', name: 'Hambúrguer', icon: '\u{1F354}', slug: 'hamburger', storeCount: 35, isActive: true },
  { id: 'cat3', name: 'Sushi', icon: '\u{1F363}', slug: 'sushi', storeCount: 15, isActive: true },
  { id: 'cat4', name: 'Brasileira', icon: '\u{1F356}', slug: 'brazilian', storeCount: 42, isActive: true },
  { id: 'cat5', name: 'Italiana', icon: '\u{1F35D}', slug: 'italian', storeCount: 18, isActive: true },
  { id: 'cat6', name: 'Asiática', icon: '\u{1F961}', slug: 'asian', storeCount: 12, isActive: true },
  { id: 'cat7', name: 'Mexicana', icon: '\u{1F32E}', slug: 'mexican', storeCount: 9, isActive: true },
  { id: 'cat8', name: 'Doces', icon: '\u{1F370}', slug: 'desserts', storeCount: 22, isActive: true },
  { id: 'cat9', name: 'Bebidas', icon: '\u{1F964}', slug: 'drinks', storeCount: 14, isActive: true },
  { id: 'cat10', name: 'Saudável', icon: '\u{1F957}', slug: 'healthy', storeCount: 11, isActive: true },
  { id: 'cat11', name: 'Café', icon: '\u2615', slug: 'coffee', storeCount: 7, isActive: false },
];

export interface MassNotification {
  id: string;
  title: string;
  message: string;
  target: 'all' | 'active' | 'inactive' | 'plan';
  planId?: string;
  sentAt: string;
  sentBy: string;
  deliveredCount: number;
  readCount: number;
}

export const massNotifications: MassNotification[] = [
  { id: 'n1', title: 'Nova taxa de entrega', message: 'A taxa de entrega ser? reajustada para 8% a partir de junho.', target: 'all', sentAt: '2026-04-10T10:00:00', sentBy: 'Admin', deliveredCount: 142, readCount: 89 },
  { id: 'n2', title: 'Manutenção programada', message: 'O marketplace ficar? fora do ar dia 15/05 das 2h s 4h para manuten??o.', target: 'all', sentAt: '2026-04-08T14:30:00', sentBy: 'Admin', deliveredCount: 156, readCount: 134 },
  { id: 'n3', title: 'Novo plano Enterprise', message: 'Agora você pode migrar para o plano Enterprise com taxas reduzidas!', target: 'active', sentAt: '2026-04-05T09:00:00', sentBy: 'Marketing', deliveredCount: 98, readCount: 72 },
  { id: 'n4', title: 'Ative sua loja', message: 'Você ainda não ativou sua loja no iFood. Complete seu cadastro e comece a vender!', target: 'inactive', sentAt: '2026-04-01T08:00:00', sentBy: 'Admin', deliveredCount: 22, readCount: 5 },
];

export interface ReportData {
  totalOrders: number;
  totalRevenue: number;
  avgTicket: number;
  storesActive: number;
  topCategory: string;
  peakHour: string;
  peakDay: string;
  deliveryVsTakeout: { delivery: number; takeout: number };
}

export const reportData: ReportData = {
  totalOrders: 12450,
  totalRevenue: 479325,
  avgTicket: 38.5,
  storesActive: 134,
  topCategory: 'Hambúrguer',
  peakHour: '19h - 20h',
  peakDay: 'Sábado',
  deliveryVsTakeout: { delivery: 78, takeout: 22 },
};

export interface PlatformMetrics {
  totalStores: number;
  activeStores: number;
  monthlyOrders: number;
  averageTicket: number;
  churnRate: number;
  totalRevenue: number;
  mrr: number;
  growthRate: number;
  topStores: { name: string; orders: number; rating: number }[];
  recentActivity: { type: 'new_store' | 'subscription' | 'payment' | 'coupon'; message: string; date: string }[];
}

export const platformMetrics: PlatformMetrics = {
  totalStores: 156,
  activeStores: 134,
  monthlyOrders: 12450,
  averageTicket: 38.5,
  churnRate: 3.2,
  totalRevenue: 284500,
  mrr: 23708,
  growthRate: 12.5,
  topStores: [
    { name: 'Pizza Brescian', orders: 1840, rating: 4.8 },
    { name: 'Churrascaria Gaúcha', orders: 1520, rating: 4.7 },
    { name: 'Sushi House', orders: 1310, rating: 4.9 },
    { name: 'Burguer King', orders: 1280, rating: 4.5 },
    { name: 'Restaurante Italiano', orders: 980, rating: 4.6 },
  ],
  recentActivity: [
    { type: 'new_store', message: 'Nova loja cadastrada: Empada da Maria', date: 'Há 15 min' },
    { type: 'subscription', message: 'Burguer King migrou para plano Enterprise', date: 'Há 2h' },
    { type: 'payment', message: 'Fatura #4582 paga - Pizza Brescian', date: 'Há 3h' },
    { type: 'coupon', message: 'Cupom FRETEGRATIS atingiu 89 usos', date: 'Há 5h' },
    { type: 'new_store', message: 'Nova loja cadastrada: Açaí do Joca', date: 'Há 6h' },
    { type: 'subscription', message: '3 assinaturas em trial expiram amanhã', date: 'Há 8h' },
  ],
};