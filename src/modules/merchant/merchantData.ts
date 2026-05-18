import type {
  MerchantBranch,
  MerchantCompany,
  MerchantMenuItem,
  MerchantOrder,
} from './types';

export const merchantCompanies: MerchantCompany[] = [
  {
    id: 'company-1',
    name: 'Grupo Franca Food',
    document: '12.345.678/0001-90',
    plan: 'Multiempresa',
  },
  {
    id: 'company-2',
    name: 'Holding Sabor Paulista',
    document: '98.765.432/0001-10',
    plan: 'Expansao',
  },
];

export const merchantBranches: MerchantBranch[] = [
  {
    id: 'branch-1',
    companyId: 'company-1',
    name: 'Pizza Brescian - Centro',
    cep: '14400-100',
    address: 'Rua General Telles',
    number: '1380',
    neighborhood: 'Centro',
    city: 'Franca',
    state: 'SP',
    coordinates: { lat: -20.5352, lng: -47.4029 },
    deliveryRadiusKm: 8,
  },
  {
    id: 'branch-2',
    companyId: 'company-1',
    name: 'Pizza Brescian - Estacao',
    cep: '14400-400',
    address: 'Av. Presidente Vargas',
    number: '1200',
    neighborhood: 'Estação',
    city: 'Franca',
    state: 'SP',
    coordinates: { lat: -20.5398, lng: -47.3981 },
    deliveryRadiusKm: 6,
  },
  {
    id: 'branch-3',
    companyId: 'company-2',
    name: 'Sushi House - Franca',
    cep: '14405-200',
    address: 'Rua Major Claudiano',
    number: '2100',
    neighborhood: 'Centro',
    city: 'Franca',
    state: 'SP',
    coordinates: { lat: -20.5325, lng: -47.4050 },
    deliveryRadiusKm: 10,
  },
];

export const merchantMenuItems: MerchantMenuItem[] = [
  {
    id: 'item-1',
    branchId: 'branch-1',
    name: 'Pizza Margherita',
    category: 'Pizzas',
    price: 45.9,
    isAvailable: true,
    description: 'Mussarela, tomate e manjericao fresco.',
  },
  {
    id: 'item-2',
    branchId: 'branch-1',
    name: 'Pizza Calabresa',
    category: 'Pizzas',
    price: 42.9,
    isAvailable: true,
    description: 'Calabresa defumada, cebola e mussarela.',
  },
  {
    id: 'item-3',
    branchId: 'branch-2',
    name: 'Combo Familia',
    category: 'Combos',
    price: 89.9,
    isAvailable: false,
    description: 'Duas pizzas grandes e refrigerante.',
  },
  {
    id: 'item-4',
    branchId: 'branch-3',
    name: 'Combinado 24 pecas',
    category: 'Sushi',
    price: 72.9,
    isAvailable: true,
    description: 'Sashimi, uramaki, hossomaki e niguiri.',
  },
];

export const merchantOrders: MerchantOrder[] = [
  {
    id: 'PED-1024',
    branchId: 'branch-1',
    customerName: 'Mariana Lopes',
    customerAddress: 'Rua Ouvidor Freire, 455 - Centro',
    createdAt: '09:18',
    status: 'new',
    paymentMethod: 'Cartao online',
    deliveryType: 'delivery',
    total: 68.7,
    items: [
      { name: 'Pizza Margherita', quantity: 1, price: 45.9 },
      { name: 'Refrigerante Lata 350ml', quantity: 2, price: 11.4 },
    ],
  },
  {
    id: 'PED-1023',
    branchId: 'branch-1',
    customerName: 'Bruno Andrade',
    customerAddress: 'Retirada no balcao',
    createdAt: '09:02',
    status: 'preparing',
    paymentMethod: 'Pix',
    deliveryType: 'pickup',
    total: 42.9,
    items: [{ name: 'Pizza Calabresa', quantity: 1, price: 42.9 }],
  },
  {
    id: 'PED-1022',
    branchId: 'branch-3',
    customerName: 'Aline Pereira',
    customerAddress: 'Av. Champagnat, 980 - Centro',
    createdAt: '08:47',
    status: 'dispatched',
    paymentMethod: 'Cartao online',
    deliveryType: 'delivery',
    total: 72.9,
    items: [{ name: 'Combinado 24 pecas', quantity: 1, price: 72.9 }],
  },
];

export interface MerchantCoupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
  maxUses: number;
  currentUses: number;
  validUntil: string;
  isActive: boolean;
}

export const merchantCoupons: MerchantCoupon[] = [
  { id: 'mc1', code: 'FRANCA10', description: '10% de desconto em pedidos acima de R$ 30', discountType: 'percentage', discountValue: 10, minOrder: 30, maxUses: 200, currentUses: 45, validUntil: '2026-12-31', isActive: true },
  { id: 'mc2', code: 'BRESCIAN5', description: 'R$ 5 de desconto em pizzas', discountType: 'fixed', discountValue: 5, minOrder: 20, maxUses: 300, currentUses: 120, validUntil: '2026-08-31', isActive: true },
  { id: 'mc3', code: 'FRETEGRATIS', description: 'Frete grátis para clientes novos', discountType: 'fixed', discountValue: 0, minOrder: 0, maxUses: 100, currentUses: 32, validUntil: '2026-06-30', isActive: false },
];


