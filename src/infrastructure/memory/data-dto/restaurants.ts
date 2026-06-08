import type { RestaurantDTO, MenuItemDTO, CategoryDTO, AdditiveDTO } from 'src/dto/restaurantDto'

export const mockCategories: CategoryDTO[] = [
  { id: 'cat-1', name: 'Hambúrgueres', icon: '🍔', slug: 'hamburgueres' },
  { id: 'cat-2', name: 'Pizzas', icon: '🍕', slug: 'pizzas' },
  { id: 'cat-3', name: 'Brasileira', icon: '🇧🇷', slug: 'brasileira' },
  { id: 'cat-4', name: 'Japonesa', icon: '🍣', slug: 'japonesa' },
  { id: 'cat-5', name: 'Mexicana', icon: '🌮', slug: 'mexicana' },
  { id: 'cat-6', name: 'Doces & Sobremesas', icon: '🍰', slug: 'doces-sobremesas' },
  { id: 'cat-7', name: 'Açaí & Sorvetes', icon: '🥤', slug: 'acai-sorvetes' },
  { id: 'cat-8', name: 'Saudável', icon: '🥗', slug: 'saudavel' },
  { id: 'cat-9', name: 'Lanches', icon: '🥪', slug: 'lanches' },
  { id: 'cat-10', name: 'Porções', icon: '🍟', slug: 'porcoes' },
  { id: 'cat-11', name: 'Bebidas', icon: '🥤', slug: 'bebidas' },
]

const a0: AdditiveDTO = { id: 'add-1', name: 'Bacon extra', price: 4.50 };
const a1: AdditiveDTO = { id: 'add-2', name: 'Queijo cheddar', price: 3.00 };
const a2: AdditiveDTO = { id: 'add-3', name: 'Molho especial', price: 2.00 };
const a3: AdditiveDTO = { id: 'add-4', name: 'Batata frita', price: 6.00 };
const a5: AdditiveDTO = { id: 'add-6', name: 'Sobremesa', price: 8.00 };

export const mockMenuItems: MenuItemDTO[] = [
  { id: 'item-1', restaurant_id: 'rest-1', name: 'X-Burger Clássico', description: 'Hambúrguer 180g, queijo, alface, tomate e molho especial', price: 28.90, original_price: 32.90, image_url: '/mock/burger1.svg', category: 'Hambúrgueres', is_available: true, additives: [a0, a1] },
  { id: 'item-2', restaurant_id: 'rest-1', name: 'X-Bacon Supreme', description: 'Hambúrguer 250g, bacon crocante, cheddar, onion rings', price: 34.90, image_url: '/mock/burger2.svg', category: 'Hambúrgueres', is_available: true, additives: [a0, a2] },
  { id: 'item-3', restaurant_id: 'rest-1', name: 'Combo Familiar', description: '2 hambúrgueres, batata frita, 2 refrigerantes', price: 59.90, image_url: '/mock/combo1.svg', category: 'Hambúrgueres', is_available: true, additives: [a0, a1, a2, a3] },
  { id: 'item-4', restaurant_id: 'rest-2', name: 'Pizza Margherita', description: 'Molho de tomate, mussarela, manjericão fresco', price: 42.90, image_url: '/mock/pizza1.svg', category: 'Pizzas', is_available: true, additives: [a2, a5] },
  { id: 'item-5', restaurant_id: 'rest-2', name: 'Pizza Pepperoni', description: 'Pepperoni, mussarela, orégano', price: 45.90, image_url: '/mock/pizza2.svg', category: 'Pizzas', is_available: true, additives: [a0, a2] },
  { id: 'item-6', restaurant_id: 'rest-3', name: 'Sushi Combo 20 peças', description: '20 peças variadas: salmão, atum, kappa maki', price: 54.90, image_url: '/mock/sushi1.svg', category: 'Japonesa', is_available: true, additives: [a5] },
  { id: 'item-7', restaurant_id: 'rest-3', name: 'Temaki Salmão', description: 'Temaki de salmão fresco com cream cheese', price: 18.90, image_url: '/mock/temaki1.svg', category: 'Japonesa', is_available: true, additives: [] },
  { id: 'item-8', restaurant_id: 'rest-4', name: 'Tacos (3 unidades)', description: 'Tacos de carne, guacamole, sour cream', price: 32.90, image_url: '/mock/taco1.svg', category: 'Mexicana', is_available: true, additives: [a2] },
  { id: 'item-9', restaurant_id: 'rest-5', name: 'Açaí 500ml', description: 'Açaí puro com banana, granola, leite condensado', price: 22.90, image_url: '/mock/acai1.svg', category: 'Açaí & Sorvetes', is_available: false, additives: [a5] },
  { id: 'item-10', restaurant_id: 'rest-6', name: 'Salada Caesar', description: 'Alface, frango grelhado, croutons, parmesão', price: 26.90, image_url: '/mock/salad1.svg', category: 'Saudável', is_available: true, additives: [a2] },
  { id: 'item-11', restaurant_id: 'rest-9', name: 'X-Burger Bahia', description: 'Hambúrguer 200g, queijo mussarela, alface, tomate e molho especial da casa', price: 26.90, original_price: 29.90, image_url: '/mock/burger1.svg', category: 'Hambúrgueres', is_available: true, additives: [a0, a1, a2] },
  { id: 'item-12', restaurant_id: 'rest-9', name: 'X-Tudo', description: 'Hambúrguer 250g, bacon, ovo, calabresa, queijo, alface, tomate, batata palha', price: 34.90, image_url: '/mock/burger2.svg', category: 'Hambúrgueres', is_available: true, additives: [a0, a1] },
  { id: 'item-13', restaurant_id: 'rest-9', name: 'Misto Quente', description: 'Pão de forma, presunto, queijo mussarela, tomate e orégano', price: 15.90, image_url: '/mock/combo1.svg', category: 'Lanches', is_available: true, additives: [] },
  { id: 'item-14', restaurant_id: 'rest-9', name: 'Batata Frita', description: 'Porção de batata frita crocante serve 2 pessoas', price: 18.90, image_url: '/mock/pizza1.svg', category: 'Porções', is_available: true, additives: [a3] },
  { id: 'item-15', restaurant_id: 'rest-9', name: 'Milk Shake de Chocolate', description: 'Milk shake cremoso de chocolate com calda e chantilly', price: 16.90, image_url: '/mock/pizza2.svg', category: 'Bebidas', is_available: true, additives: [] },
  { id: 'item-16', restaurant_id: 'rest-9', name: 'Suco Natural de Laranja', description: 'Suco de laranja natural 500ml', price: 9.90, image_url: '/mock/acai1.svg', category: 'Bebidas', is_available: true, additives: [] },
]

/**
 * Franca-SP center: lat -20.5386, lng -47.4008
 * Bairros reais de Franca com coordenadas aproximadas.
 *
 * Fase 28 — Cobertura derivada de restaurants ativos (ADR-003):
 * - `is_active: true` para todos (default da migration)
 * - `state: 'SP'`, `city: 'Franca'` consistente
 * - `neighborhood` em 4 bairros diferentes
 * - `latitude`/`longitude` com offset a partir do centro
 * - `delivery_radius_km: 8` (padrão)
 * - `coverage_zone_type: 'city'` (Fase 28.1)
 */
export const mockRestaurants: RestaurantDTO[] = [
  { id: 'rest-1', name: 'Burger House', description: 'Os melhores hambúrgueres artesanais da cidade', cuisine: 'Hambúrgueres', rating: 4.7, review_count: 1234, delivery_time: '30-45 min', delivery_fee: 5.00, image_url: '/mock/rest1.svg', banner_url: '/mock/banner1.svg', is_featured: true, is_active: true, distance: '1.2 km', promotional_offer: 'Frete grátis em pedidos acima de R$ 50', city: 'Franca', state: 'SP', neighborhood: 'Centro', address: 'Rua Major Claudiano, 1234', latitude: -20.5386, longitude: -47.4008, delivery_radius_km: 8, coverage_zone_type: 'city', coordinates: { lat: -20.5386, lng: -47.4008 } },
  { id: 'rest-2', name: 'Pizza Napoli', description: 'Pizzas tradicionais italianas assadas no forno a lenha', cuisine: 'Pizzas', rating: 4.5, review_count: 892, delivery_time: '35-50 min', delivery_fee: 4.00, image_url: '/mock/rest2.svg', banner_url: '/mock/banner2.svg', is_featured: true, is_active: true, distance: '2.5 km', city: 'Franca', state: 'SP', neighborhood: 'Centro', address: 'Rua Monsenhor Rosa, 567', latitude: -20.5402, longitude: -47.4021, delivery_radius_km: 8, coverage_zone_type: 'city', coordinates: { lat: -20.5402, lng: -47.4021 } },
  { id: 'rest-3', name: 'Sakura Sushi', description: 'Culinária japonesa com ingredientes frescos', cuisine: 'Japonesa', rating: 4.8, review_count: 2103, delivery_time: '25-40 min', delivery_fee: 6.00, image_url: '/mock/rest3.svg', banner_url: '/mock/banner3.svg', is_featured: true, is_active: true, distance: '3.1 km', promotional_offer: 'Compre 2 combos e ganhe 1 temaki', city: 'Franca', state: 'SP', neighborhood: 'São José', address: 'Av. São José, 890', latitude: -20.5320, longitude: -47.4150, delivery_radius_km: 8, coverage_zone_type: 'city', coordinates: { lat: -20.5320, lng: -47.4150 } },
  { id: 'rest-4', name: 'El Mexicano', description: 'Autêntica comida mexicana', cuisine: 'Mexicana', rating: 4.3, review_count: 456, delivery_time: '30-45 min', delivery_fee: 4.50, image_url: '/mock/rest4.svg', banner_url: '/mock/banner4.svg', is_active: true, distance: '4.0 km', city: 'Franca', state: 'SP', neighborhood: 'São José', address: 'Rua Voluntário Jaime de Aguiar, 234', latitude: -20.5298, longitude: -47.4187, delivery_radius_km: 8, coverage_zone_type: 'city', coordinates: { lat: -20.5298, lng: -47.4187 } },
  { id: 'rest-5', name: 'Açaí da Vila', description: 'Açaí e sorvetes artesanais', cuisine: 'Açaí & Sorvetes', rating: 4.6, review_count: 678, delivery_time: '20-30 min', delivery_fee: 3.00, image_url: '/mock/rest5.svg', banner_url: '/mock/banner5.svg', is_active: true, distance: '0.8 km', promotional_offer: '2 unidades pelo preço de 1', city: 'Franca', state: 'SP', neighborhood: 'Cidade Nova', address: 'Av. Brasil, 1500', latitude: -20.5450, longitude: -47.3900, delivery_radius_km: 8, coverage_zone_type: 'city', coordinates: { lat: -20.5450, lng: -47.3900 } },
  { id: 'rest-6', name: 'Green Bowls', description: 'Comida saudável e saborosa', cuisine: 'Saudável', rating: 4.4, review_count: 345, delivery_time: '25-35 min', delivery_fee: 5.50, image_url: '/mock/rest6.svg', banner_url: '/mock/banner6.svg', is_featured: true, is_active: true, distance: '1.5 km', city: 'Franca', state: 'SP', neighborhood: 'Cidade Nova', address: 'Rua Padre Anchieta, 678', latitude: -20.5470, longitude: -47.3870, delivery_radius_km: 8, coverage_zone_type: 'city', coordinates: { lat: -20.5470, lng: -47.3870 } },
  { id: 'rest-7', name: 'Dona Maria', description: 'Comida caseira como a da vovó', cuisine: 'Brasileira', rating: 4.9, review_count: 3890, delivery_time: '30-40 min', delivery_fee: 4.00, image_url: '/mock/rest7.svg', banner_url: '/mock/banner7.svg', is_active: true, distance: '2.0 km', promotional_offer: 'Desconto de 10% no primeiro pedido', city: 'Franca', state: 'SP', neighborhood: 'Jardim Brasil', address: 'Rua Marechal Deodoro, 432', latitude: -20.5510, longitude: -47.4080, delivery_radius_km: 8, coverage_zone_type: 'city', coordinates: { lat: -20.5510, lng: -47.4080 } },
  { id: 'rest-8', name: 'Doceria Sabor & Arte', description: 'Bolos, tortas e doces finos', cuisine: 'Doces & Sobremesas', rating: 4.7, review_count: 1234, delivery_time: '20-35 min', delivery_fee: 3.50, image_url: '/mock/rest8.svg', banner_url: '/mock/banner8.svg', is_active: true, distance: '1.8 km', city: 'Franca', state: 'SP', neighborhood: 'Jardim Brasil', address: 'Rua Ouvidor Freire, 156', latitude: -20.5540, longitude: -47.4060, delivery_radius_km: 8, coverage_zone_type: 'city', coordinates: { lat: -20.5540, lng: -47.4060 } },
  { id: 'rest-9', name: 'Bahia Lanches', description: 'Lanchonete tradicional com os melhores sanduíches e hambúrgueres da região', cuisine: 'Hambúrgueres', rating: 4.6, review_count: 542, delivery_time: '25-35 min', delivery_fee: 4.00, image_url: '/mock/rest9.svg', banner_url: '/mock/banner9.svg', is_active: true, promotional_offer: '10% de desconto no primeiro pedido', city: 'Franca', state: 'SP', neighborhood: 'Vila Rezende', address: 'Av. Min. Rui Barbosa, 1965', latitude: -20.5275, longitude: -47.4401, delivery_radius_km: 8, coverage_zone_type: 'city', distance: '3.5 km', coordinates: { lat: -20.5274671, lng: -47.440134 } },
]
