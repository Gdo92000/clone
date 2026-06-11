import type { MerchantMenuItem } from 'src/types/merchant';

export const mockMerchantMenuItems: MerchantMenuItem[] = [
  { id: 'm-item-1', branchId: 'branch-1', name: 'X-Burger Clássico', category: 'Hambúrgueres', price: 28.90, isAvailable: true, isVisibleToConsumer: true, description: 'Hambúrguer 180g, queijo, alface, tomate' },
  { id: 'm-item-2', branchId: 'branch-1', name: 'X-Bacon Supreme', category: 'Hambúrgueres', price: 34.90, isAvailable: true, isVisibleToConsumer: true, description: 'Hambúrguer 250g, bacon, cheddar' },
  { id: 'm-item-3', branchId: 'branch-1', name: 'Batata Frita', category: 'Acompanhamentos', price: 12.90, isAvailable: true, isVisibleToConsumer: true, description: 'Batata frita crocante' },
  { id: 'm-item-4', branchId: 'branch-2', name: 'X-Burger Clássico', category: 'Hambúrgueres', price: 29.90, isAvailable: true, isVisibleToConsumer: true, description: 'Hambúrguer 180g, queijo, alface, tomate' },
  { id: 'm-item-5', branchId: 'branch-3', name: 'Sushi Combo 20 peças', category: 'Combinados', price: 54.90, isAvailable: true, isVisibleToConsumer: true, description: '20 peças variadas' },
  { id: 'm-item-6', branchId: 'branch-3', name: 'Temaki Salmão', category: 'Temakis', price: 18.90, isAvailable: true, isVisibleToConsumer: true, description: 'Temaki de salmão fresco' },
  { id: 'm-item-7', branchId: 'branch-4', name: 'Prato Feito', category: 'Executivos', price: 24.90, isAvailable: true, isVisibleToConsumer: true, description: 'Arroz, feijão, bife acebolado, fritas' },
  { id: 'm-item-8', branchId: 'branch-4', name: 'Strogonoff de Frango', category: 'Executivos', price: 28.90, isAvailable: false, isVisibleToConsumer: true, description: 'Strogonoff de frango com arroz e batata palha' },
];
