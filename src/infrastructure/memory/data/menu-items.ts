import type { MenuItem, Additive } from 'src/domain/entities/Restaurant';

const A0: Additive = { id: 'add-1', name: 'Bacon extra', price: 4.50 };
const A1: Additive = { id: 'add-2', name: 'Queijo cheddar', price: 3.00 };
const A2: Additive = { id: 'add-3', name: 'Molho especial', price: 2.00 };
const A3: Additive = { id: 'add-4', name: 'Batata frita', price: 6.00 };
const A4: Additive = { id: 'add-5', name: 'Sobremesa', price: 8.00 };

export const mockAdditives: Additive[] = [A0, A1, A2, A3, A4];

export const mockMenuItems: MenuItem[] = [
  { id: 'item-1', restaurantId: 'rest-1', name: 'X-Burger Clássico', description: 'Hambúrguer 180g, queijo, alface, tomate e molho especial', price: 28.90, originalPrice: 32.90, imageUrl: '/mock/burger1.svg', category: 'Hambúrgueres', isAvailable: true, additives: [A0, A1] },
  { id: 'item-2', restaurantId: 'rest-1', name: 'X-Bacon Supreme', description: 'Hambúrguer 250g, bacon crocante, cheddar, onion rings', price: 34.90, imageUrl: '/mock/burger2.svg', category: 'Hambúrgueres', isAvailable: true, additives: [A0, A2] },
  { id: 'item-3', restaurantId: 'rest-1', name: 'Combo Familiar', description: '2 hambúrgueres, batata frita, 2 refrigerantes', price: 59.90, imageUrl: '/mock/combo1.svg', category: 'Hambúrgueres', isAvailable: true, additives: [A0, A1, A2, A3] },
  { id: 'item-4', restaurantId: 'rest-2', name: 'Pizza Margherita', description: 'Molho de tomate, mussarela, manjericão fresco', price: 42.90, imageUrl: '/mock/pizza1.svg', category: 'Pizzas', isAvailable: true, additives: [A2, A4] },
  { id: 'item-5', restaurantId: 'rest-2', name: 'Pizza Pepperoni', description: 'Pepperoni, mussarela, orégano', price: 45.90, imageUrl: '/mock/pizza2.svg', category: 'Pizzas', isAvailable: true, additives: [A0, A2] },
  { id: 'item-6', restaurantId: 'rest-3', name: 'Sushi Combo 20 peças', description: '20 peças variadas: salmão, atum, kappa maki', price: 54.90, imageUrl: '/mock/sushi1.svg', category: 'Japonesa', isAvailable: true, additives: [A4] },
  { id: 'item-7', restaurantId: 'rest-3', name: 'Temaki Salmão', description: 'Temaki de salmão fresco com cream cheese', price: 18.90, imageUrl: '/mock/temaki1.svg', category: 'Japonesa', isAvailable: true, additives: [] },
  { id: 'item-8', restaurantId: 'rest-4', name: 'Tacos (3 unidades)', description: 'Tacos de carne, guacamole, sour cream', price: 32.90, imageUrl: '/mock/taco1.svg', category: 'Mexicana', isAvailable: true, additives: [A2] },
  { id: 'item-9', restaurantId: 'rest-5', name: 'Açaí 500ml', description: 'Açaí puro com banana, granola, leite condensado', price: 22.90, imageUrl: '/mock/acai1.svg', category: 'Açaí & Sorvetes', isAvailable: false, additives: [A4] },
  { id: 'item-10', restaurantId: 'rest-6', name: 'Salada Caesar', description: 'Alface, frango grelhado, croutons, parmesão', price: 26.90, imageUrl: '/mock/salad1.svg', category: 'Saudável', isAvailable: true, additives: [A2] },
  { id: 'item-11', restaurantId: 'rest-9', name: 'X-Burger Bahia', description: 'Hambúrguer 200g, queijo mussarela, alface, tomate e molho especial da casa', price: 26.90, originalPrice: 29.90, imageUrl: '/mock/burger1.svg', category: 'Hambúrgueres', isAvailable: true, additives: [A0, A1, A2] },
  { id: 'item-12', restaurantId: 'rest-9', name: 'X-Tudo', description: 'Hambúrguer 250g, bacon, ovo, calabresa, queijo, alface, tomate, batata palha', price: 34.90, imageUrl: '/mock/burger2.svg', category: 'Hambúrgueres', isAvailable: true, additives: [A0, A1] },
  { id: 'item-13', restaurantId: 'rest-9', name: 'Misto Quente', description: 'Pão de forma, presunto, queijo mussarela, tomate e orégano', price: 15.90, imageUrl: '/mock/combo1.svg', category: 'Lanches', isAvailable: true, additives: [] },
  { id: 'item-14', restaurantId: 'rest-9', name: 'Batata Frita', description: 'Porção de batata frita crocante serve 2 pessoas', price: 18.90, imageUrl: '/mock/pizza1.svg', category: 'Porções', isAvailable: true, additives: [A3] },
  { id: 'item-15', restaurantId: 'rest-9', name: 'Milk Shake de Chocolate', description: 'Milk shake cremoso de chocolate com calda e chantilly', price: 16.90, imageUrl: '/mock/pizza2.svg', category: 'Bebidas', isAvailable: true, additives: [] },
  { id: 'item-16', restaurantId: 'rest-9', name: 'Suco Natural de Laranja', description: 'Suco de laranja natural 500ml', price: 9.90, imageUrl: '/mock/acai1.svg', category: 'Bebidas', isAvailable: true, additives: [] },
];
