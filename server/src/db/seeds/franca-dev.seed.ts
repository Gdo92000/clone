import { eq, inArray } from 'drizzle-orm';
import { db } from '../index';
import { restaurants, categories, coverageCities, companies, branches, plans, menuItems, additives } from '../schema';
import { logger } from '../../lib/logger';

type CuisineEnum = 'pizza' | 'hamburger' | 'brazilian' | 'japanese' | 'mexican' | 'italian' | 'chinese' | 'healthy' | 'dessert' | 'cafe' | 'arabic' | 'seafood' | 'other';

interface FrancaRestaurant {
  id: string;
  name: string;
  description: string;
  cuisineLabel: string;
  cuisine: CuisineEnum;
  categorySlug: string;
  rating: number;
  review_count: number;
  delivery_time: string;
  delivery_fee: string;
  image_url: string;
  banner_url: string;
  is_featured: boolean;
  promotional_offer: string | null;
  city: string;
  state: string;
  neighborhood: string;
  address: string;
  latitude: string;
  longitude: string;
  delivery_radius_km: number;
  coverage_zone_type: 'city' | 'neighborhood' | 'radius' | 'polygon';
}

const FRANCA_LAT = '-20.5386000';
const FRANCA_LNG = '-47.4008000';

const FRANCA_CATEGORIES: Array<{ id: string; name: string; icon: string; slug: string }> = [
  { id: 'cat-1', name: 'Hambúrgueres', icon: '🍔', slug: 'hamburgueres' },
  { id: 'cat-2', name: 'Pizzas', icon: '🍕', slug: 'pizzas' },
  { id: 'cat-3', name: 'Brasileira', icon: '🇧🇷', slug: 'brasileira' },
  { id: 'cat-4', name: 'Japonesa', icon: '🍣', slug: 'japonesa' },
  { id: 'cat-5', name: 'Mexicana', icon: '🌮', slug: 'mexicana' },
  { id: 'cat-6', name: 'Doces & Sobremesas', icon: '🍰', slug: 'doces-sobremesas' },
  { id: 'cat-7', name: 'Açaí & Sorvetes', icon: '🥤', slug: 'acai-sorvetes' },
  { id: 'cat-8', name: 'Saudável', icon: '🥗', slug: 'saudavel' },
];

const FRANCA_RESTAURANTS: FrancaRestaurant[] = [
  {
    id: 'rest-1', name: 'Burger House', description: 'Os melhores hambúrgueres artesanais da cidade',
    cuisineLabel: 'Hambúrgueres', cuisine: 'hamburger', categorySlug: 'hamburgueres',
    rating: 4.7, review_count: 1234, delivery_time: '30-45 min', delivery_fee: '5.00',
    image_url: '/mock/rest1.jpg', banner_url: '/mock/banner1.jpg', is_featured: true,
    promotional_offer: 'Frete grátis em pedidos acima de R$ 50',
    city: 'Franca', state: 'SP', neighborhood: 'Centro', address: 'Rua Major Claudiano, 1234',
    latitude: '-20.5380200', longitude: '-47.4005100', delivery_radius_km: 8, coverage_zone_type: 'city',
  },
  {
    id: 'rest-2', name: 'Pizza Napoli', description: 'Pizzas tradicionais italianas assadas no forno a lenha',
    cuisineLabel: 'Pizzas', cuisine: 'pizza', categorySlug: 'pizzas',
    rating: 4.5, review_count: 892, delivery_time: '35-50 min', delivery_fee: '4.00',
    image_url: '/mock/rest2.jpg', banner_url: '/mock/banner2.jpg', is_featured: true,
    promotional_offer: null,
    city: 'Franca', state: 'SP', neighborhood: 'Centro', address: 'Rua Monsenhor Rosa, 567',
    latitude: '-20.5397500', longitude: '-47.4018200', delivery_radius_km: 8, coverage_zone_type: 'city',
  },
  {
    id: 'rest-3', name: 'Sakura Sushi', description: 'Culinária japonesa com ingredientes frescos',
    cuisineLabel: 'Japonesa', cuisine: 'japanese', categorySlug: 'japonesa',
    rating: 4.8, review_count: 2103, delivery_time: '25-40 min', delivery_fee: '6.00',
    image_url: '/mock/rest3.jpg', banner_url: '/mock/banner3.jpg', is_featured: true,
    promotional_offer: 'Compre 2 combos e ganhe 1 temaki',
    city: 'Franca', state: 'SP', neighborhood: 'São José', address: 'Av. São José, 890',
    latitude: '-20.5315800', longitude: '-47.4144500', delivery_radius_km: 8, coverage_zone_type: 'city',
  },
  {
    id: 'rest-4', name: 'El Mexicano', description: 'Autêntica comida mexicana',
    cuisineLabel: 'Mexicana', cuisine: 'mexican', categorySlug: 'mexicana',
    rating: 4.3, review_count: 456, delivery_time: '30-45 min', delivery_fee: '4.50',
    image_url: '/mock/rest4.jpg', banner_url: '/mock/banner4.jpg', is_featured: false,
    promotional_offer: null,
    city: 'Franca', state: 'SP', neighborhood: 'São José', address: 'Rua Voluntário Jaime de Aguiar, 234',
    latitude: '-20.5298000', longitude: '-47.4187000', delivery_radius_km: 8, coverage_zone_type: 'city',
  },
  {
    id: 'rest-5', name: 'Açaí da Vila', description: 'Açaí e sorvetes artesanais',
    cuisineLabel: 'Açaí & Sorvetes', cuisine: 'other', categorySlug: 'acai-sorvetes',
    rating: 4.6, review_count: 678, delivery_time: '20-30 min', delivery_fee: '3.00',
    image_url: '/mock/rest5.jpg', banner_url: '/mock/banner5.jpg', is_featured: false,
    promotional_offer: '2 unidades pelo preço de 1',
    city: 'Franca', state: 'SP', neighborhood: 'Cidade Nova', address: 'Av. Brasil, 1500',
    latitude: '-20.5443500', longitude: '-47.3894100', delivery_radius_km: 8, coverage_zone_type: 'city',
  },
  {
    id: 'rest-6', name: 'Green Bowls', description: 'Comida saudável e saborosa',
    cuisineLabel: 'Saudável', cuisine: 'healthy', categorySlug: 'saudavel',
    rating: 4.4, review_count: 345, delivery_time: '25-35 min', delivery_fee: '5.50',
    image_url: '/mock/rest6.jpg', banner_url: '/mock/banner6.jpg', is_featured: true,
    promotional_offer: null,
    city: 'Franca', state: 'SP', neighborhood: 'Cidade Nova', address: 'Rua Padre Anchieta, 678',
    latitude: '-20.5464800', longitude: '-47.3865200', delivery_radius_km: 8, coverage_zone_type: 'city',
  },
  {
    id: 'rest-7', name: 'Dona Maria', description: 'Comida caseira como a da vovó',
    cuisineLabel: 'Brasileira', cuisine: 'brazilian', categorySlug: 'brasileira',
    rating: 4.9, review_count: 3890, delivery_time: '30-40 min', delivery_fee: '4.00',
    image_url: '/mock/rest7.jpg', banner_url: '/mock/banner7.jpg', is_featured: false,
    promotional_offer: 'Desconto de 10% no primeiro pedido',
    city: 'Franca', state: 'SP', neighborhood: 'Jardim Brasil', address: 'Rua Marechal Deodoro, 432',
    latitude: '-20.5507200', longitude: '-47.4073800', delivery_radius_km: 8, coverage_zone_type: 'city',
  },
  {
    id: 'rest-8', name: 'Doceria Sabor & Arte', description: 'Bolos, tortas e doces finos',
    cuisineLabel: 'Doces & Sobremesas', cuisine: 'dessert', categorySlug: 'doces-sobremesas',
    rating: 4.7, review_count: 1234, delivery_time: '20-35 min', delivery_fee: '3.50',
    image_url: '/mock/rest8.jpg', banner_url: '/mock/banner8.jpg', is_featured: false,
    promotional_offer: null,
    city: 'Franca', state: 'SP', neighborhood: 'Jardim Brasil', address: 'Rua Ouvidor Freire, 156',
    latitude: '-20.5535800', longitude: '-47.4054100', delivery_radius_km: 8, coverage_zone_type: 'city',
  },
  {
    id: 'rest-9', name: 'Bahia Lanches', description: 'Lanches tradicionais com toque baiano',
    cuisineLabel: 'Lanches', cuisine: 'other', categorySlug: 'hamburgueres',
    rating: 4.5, review_count: 567, delivery_time: '25-40 min', delivery_fee: '4.50',
    image_url: '/mock/rest9.jpg', banner_url: '/mock/banner9.jpg', is_featured: false,
    promotional_offer: null,
    city: 'Franca', state: 'SP', neighborhood: 'São José', address: 'Av. São José, 1500',
    latitude: '-20.5274671', longitude: '-47.4401340', delivery_radius_km: 8, coverage_zone_type: 'city',
  },
];

interface SeedMenuItem {
  id: string;
  restaurant_id: string;
  branch_id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  original_price: string | null;
  image_url: string;
  is_available: boolean;
}

const SEED_MENU_ITEMS: SeedMenuItem[] = [
  { id: 'item-1', restaurant_id: 'rest-1', branch_id: 'rest-1', name: 'X-Burger Clássico', description: 'Hambúrguer 180g, queijo, alface, tomate e molho especial', category: 'Hambúrgueres', price: '28.90', original_price: '32.90', image_url: '/mock/burger1.svg', is_available: true },
  { id: 'item-2', restaurant_id: 'rest-1', branch_id: 'rest-1', name: 'X-Bacon Supreme', description: 'Hambúrguer 250g, bacon crocante, cheddar, onion rings', category: 'Hambúrgueres', price: '34.90', original_price: null, image_url: '/mock/burger2.svg', is_available: true },
  { id: 'item-3', restaurant_id: 'rest-1', branch_id: 'rest-1', name: 'Combo Familiar', description: '2 hambúrgueres, batata frita, 2 refrigerantes', category: 'Hambúrgueres', price: '59.90', original_price: null, image_url: '/mock/combo1.svg', is_available: true },
  { id: 'item-4', restaurant_id: 'rest-2', branch_id: 'rest-2', name: 'Pizza Margherita', description: 'Molho de tomate, mussarela, manjericão fresco', category: 'Pizzas', price: '42.90', original_price: null, image_url: '/mock/pizza1.svg', is_available: true },
  { id: 'item-5', restaurant_id: 'rest-2', branch_id: 'rest-2', name: 'Pizza Pepperoni', description: 'Pepperoni, mussarela, orégano', category: 'Pizzas', price: '45.90', original_price: null, image_url: '/mock/pizza2.svg', is_available: true },
  { id: 'item-6', restaurant_id: 'rest-3', branch_id: 'rest-3', name: 'Sushi Combo 20 peças', description: '20 peças variadas: salmão, atum, kappa maki', category: 'Japonesa', price: '54.90', original_price: null, image_url: '/mock/sushi1.svg', is_available: true },
  { id: 'item-7', restaurant_id: 'rest-3', branch_id: 'rest-3', name: 'Temaki Salmão', description: 'Temaki de salmão fresco com cream cheese', category: 'Japonesa', price: '18.90', original_price: null, image_url: '/mock/temaki1.svg', is_available: true },
  { id: 'item-8', restaurant_id: 'rest-4', branch_id: 'rest-4', name: 'Tacos (3 unidades)', description: 'Tacos de carne, guacamole, sour cream', category: 'Mexicana', price: '32.90', original_price: null, image_url: '/mock/taco1.svg', is_available: true },
  { id: 'item-9', restaurant_id: 'rest-5', branch_id: 'rest-5', name: 'Açaí 500ml', description: 'Açaí puro com banana, granola, leite condensado', category: 'Açaí & Sorvetes', price: '22.90', original_price: null, image_url: '/mock/acai1.svg', is_available: false },
  { id: 'item-10', restaurant_id: 'rest-6', branch_id: 'rest-6', name: 'Salada Caesar', description: 'Alface, frango grelhado, croutons, parmesão', category: 'Saudável', price: '26.90', original_price: null, image_url: '/mock/salad1.svg', is_available: true },
  { id: 'item-11', restaurant_id: 'rest-9', branch_id: 'rest-9', name: 'X-Burger Bahia', description: 'Hambúrguer 200g, queijo mussarela, alface, tomate e molho especial', category: 'Hambúrgueres', price: '26.90', original_price: '29.90', image_url: '/mock/burger1.svg', is_available: true },
  { id: 'item-12', restaurant_id: 'rest-9', branch_id: 'rest-9', name: 'X-Tudo', description: 'Hambúrguer 250g, bacon, ovo, calabresa, queijo, alface, tomate, batata palha', category: 'Hambúrgueres', price: '34.90', original_price: null, image_url: '/mock/burger2.svg', is_available: true },
  { id: 'item-13', restaurant_id: 'rest-9', branch_id: 'rest-9', name: 'Misto Quente', description: 'Pão de forma, presunto, queijo mussarela, tomate e orégano', category: 'Lanches', price: '15.90', original_price: null, image_url: '/mock/combo1.svg', is_available: true },
  { id: 'item-14', restaurant_id: 'rest-9', branch_id: 'rest-9', name: 'Batata Frita', description: 'Porção de batata frita crocante serve 2 pessoas', category: 'Porções', price: '18.90', original_price: null, image_url: '/mock/pizza1.svg', is_available: true },
  { id: 'item-15', restaurant_id: 'rest-9', branch_id: 'rest-9', name: 'Milk Shake de Chocolate', description: 'Milk shake cremoso de chocolate com calda e chantilly', category: 'Bebidas', price: '16.90', original_price: null, image_url: '/mock/pizza2.svg', is_available: true },
  { id: 'item-16', restaurant_id: 'rest-9', branch_id: 'rest-9', name: 'Suco Natural de Laranja', description: 'Suco de laranja natural 500ml', category: 'Bebidas', price: '9.90', original_price: null, image_url: '/mock/acai1.svg', is_available: true },
];

export interface SeedFrancaDevResult {
  restaurantsInserted: number;
  categoriesInserted: number;
  coverageCityInserted: boolean;
  branchesInserted: number;
  menuItemsInserted: number;
  skipped: boolean;
}

export async function seedFrancaDev(force = false): Promise<SeedFrancaDevResult> {
  logger.info('🌱 Seed Franca Dev: verificando estado do banco');

  const existing = await db.select({ id: restaurants.id }).from(restaurants).limit(1);
  if (existing.length > 0 && !force) {
    logger.info('⏭️ Seed Franca Dev: banco já possui restaurants, pulando', { existing: existing.length });
    return { restaurantsInserted: 0, categoriesInserted: 0, coverageCityInserted: false, branchesInserted: 0, menuItemsInserted: 0, skipped: true };
  }

  if (force) {
    logger.info('🔄 Seed Franca Dev: force=true, limpando dados Franca existentes');
    const francaIds = FRANCA_RESTAURANTS.map((r) => r.id);
    await db.delete(restaurants).where(inArray(restaurants.id, francaIds));
  }

  const existingCategories = await db
    .select({ id: categories.id })
    .from(categories)
    .where(inArray(categories.slug, FRANCA_CATEGORIES.map((c) => c.slug)));

  if (existingCategories.length === 0) {
    logger.info('🌱 Seed Franca Dev: inserindo 8 categorias');
    await db.insert(categories).values(
      FRANCA_CATEGORIES.map((c) => ({
        id: c.id, name: c.name, slug: c.slug, icon: c.icon,
        store_count: FRANCA_RESTAURANTS.filter((r) => r.categorySlug === c.slug).length,
        is_active: true,
      })),
    );
  } else {
    logger.info('⏭️ Seed Franca Dev: categorias já existem', { existing: existingCategories.length });
  }

  logger.info('🌱 Seed Franca Dev: inserindo 9 restaurants de Franca');
  await db.insert(restaurants).values(
    FRANCA_RESTAURANTS.map((r) => {
      const category = FRANCA_CATEGORIES.find((c) => c.slug === r.categorySlug);
      return {
        id: r.id,
        name: r.name,
        slug: r.id,
        description: r.description,
        cuisine: r.cuisine,
        category_id: category?.id ?? null,
        address: r.address,
        number: null,
        neighborhood: r.neighborhood,
        city: r.city,
        state: r.state,
        zip_code: null,
        phone: null,
        image_url: r.image_url,
        banner_url: r.banner_url,
        delivery_fee: r.delivery_fee,
        delivery_time: r.delivery_time,
        rating: r.rating.toFixed(2),
        review_count: r.review_count,
        is_featured: r.is_featured,
        is_active: true,
        promotional_offer: r.promotional_offer,
        latitude: r.latitude,
        longitude: r.longitude,
        delivery_radius_km: r.delivery_radius_km,
        coverage_zone_type: r.coverage_zone_type,
        coverage_polygon: null,
        payment_methods: null,
      };
    }),
  );

  const existingCoverage = await db
    .select({ id: coverageCities.id })
    .from(coverageCities)
    .where(eq(coverageCities.id, 'city-franca'))
    .limit(1);

  if (existingCoverage.length === 0) {
    logger.info('🌱 Seed Franca Dev: inserindo coverage_city Franca');
    await db.insert(coverageCities).values({
      id: 'city-franca',
      name: 'Franca',
      state: 'SP',
      latitude: FRANCA_LAT,
      longitude: FRANCA_LNG,
      radius_km: 18,
      restaurant_count: FRANCA_RESTAURANTS.length,
      is_active: true,
    });
  }

  const existingPlans = await db.select({ id: plans.id }).from(plans).limit(1);
  if (existingPlans.length === 0) {
    logger.info('🌱 Seed Franca Dev: inserindo planos basic/pro/premium');
    const planData = [
      { id: 'basic' as const, name: 'Basic', monthly_price: '49.90', description: 'Para pequenos negócios', max_branches: 1, max_products: 50, max_users: 3, max_campaigns: 0 },
      { id: 'pro' as const, name: 'Pro', monthly_price: '99.90', description: 'Para negócios em crescimento', max_branches: 3, max_products: 200, max_users: 10, max_campaigns: 5 },
      { id: 'premium' as const, name: 'Premium', monthly_price: '199.90', description: 'Para redes e operações grandes', max_branches: 10, max_products: 1000, max_users: 50, max_campaigns: 20 },
    ];
    await db.insert(plans).values(planData);
  }

  const COMPANY_ID = 'company-1';
  const existingCompany = await db.select({ id: companies.id }).from(companies).where(eq(companies.id, COMPANY_ID)).limit(1);
  let branchesInserted = 0;
  if (existingCompany.length === 0) {
    logger.info('🌱 Seed Franca Dev: inserindo company-1');
    await db.insert(companies).values({
      id: COMPANY_ID,
      name: 'Franca Delivery Ltda',
      document: '00.000.000/0001-91',
      plan_id: 'premium',
      is_active: true,
    });
    logger.info('🌱 Seed Franca Dev: inserindo branches (1 por restaurant)');
    for (const r of FRANCA_RESTAURANTS) {
      await db.insert(branches).values({
        id: r.id,
        company_id: COMPANY_ID,
        name: r.name,
        address: r.address,
        number: null,
        neighborhood: r.neighborhood,
        city: r.city,
        state: r.state,
        latitude: r.latitude,
        longitude: r.longitude,
        delivery_radius_km: r.delivery_radius_km,
        phone: null,
      });
      branchesInserted++;
    }
  } else {
    logger.info('⏭️ Seed Franca Dev: company já existe, pulando branches');
  }

  const existingMenuItems = await db.select({ id: menuItems.id }).from(menuItems).limit(1);
  let menuItemsInserted = 0;
  if (existingMenuItems.length === 0) {
    logger.info('🌱 Seed Franca Dev: inserindo menu items');
    await db.insert(menuItems).values(
      SEED_MENU_ITEMS.map((item) => ({
        id: item.id,
        restaurant_id: item.restaurant_id,
        branch_id: item.branch_id,
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price,
        original_price: item.original_price,
        image_url: item.image_url,
        is_available: item.is_available,
        is_visible_to_consumer: true,
      })),
    );
    menuItemsInserted = SEED_MENU_ITEMS.length;
  } else {
    logger.info('⏭️ Seed Franca Dev: menu items já existem, pulando');
  }

  const existingAdditives = await db.select({ id: additives.id }).from(additives).limit(1);
  if (existingAdditives.length === 0) {
    logger.info('🌱 Seed Franca Dev: inserindo additives');
    const additiveData = [
      { id: 'add-1', menu_item_id: 'item-1', name: 'Bacon extra', price: '4.50' },
      { id: 'add-2', menu_item_id: 'item-1', name: 'Queijo cheddar', price: '3.00' },
      { id: 'add-3', menu_item_id: 'item-2', name: 'Bacon extra', price: '4.50' },
      { id: 'add-4', menu_item_id: 'item-2', name: 'Molho especial', price: '2.00' },
      { id: 'add-5', menu_item_id: 'item-3', name: 'Bacon extra', price: '4.50' },
      { id: 'add-6', menu_item_id: 'item-3', name: 'Queijo cheddar', price: '3.00' },
      { id: 'add-7', menu_item_id: 'item-3', name: 'Molho especial', price: '2.00' },
      { id: 'add-8', menu_item_id: 'item-3', name: 'Batata frita', price: '6.00' },
      { id: 'add-9', menu_item_id: 'item-4', name: 'Molho especial', price: '2.00' },
      { id: 'add-10', menu_item_id: 'item-4', name: 'Sobremesa', price: '8.00' },
      { id: 'add-11', menu_item_id: 'item-5', name: 'Bacon extra', price: '4.50' },
      { id: 'add-12', menu_item_id: 'item-5', name: 'Molho especial', price: '2.00' },
      { id: 'add-13', menu_item_id: 'item-6', name: 'Sobremesa', price: '8.00' },
      { id: 'add-14', menu_item_id: 'item-8', name: 'Molho especial', price: '2.00' },
      { id: 'add-15', menu_item_id: 'item-9', name: 'Sobremesa', price: '8.00' },
      { id: 'add-16', menu_item_id: 'item-10', name: 'Molho especial', price: '2.00' },
      { id: 'add-17', menu_item_id: 'item-11', name: 'Bacon extra', price: '4.50' },
      { id: 'add-18', menu_item_id: 'item-11', name: 'Queijo cheddar', price: '3.00' },
      { id: 'add-19', menu_item_id: 'item-11', name: 'Molho especial', price: '2.00' },
      { id: 'add-20', menu_item_id: 'item-12', name: 'Bacon extra', price: '4.50' },
      { id: 'add-21', menu_item_id: 'item-12', name: 'Queijo cheddar', price: '3.00' },
      { id: 'add-22', menu_item_id: 'item-14', name: 'Batata frita', price: '6.00' },
    ];
    await db.insert(additives).values(additiveData);
  } else {
    logger.info('⏭️ Seed Franca Dev: additives já existem, pulando');
  }

  logger.info('✅ Seed Franca Dev concluído', {
    restaurants: FRANCA_RESTAURANTS.length,
    categories: FRANCA_CATEGORIES.length,
    coverageCity: 'city-franca',
    branches: branchesInserted,
    menuItems: menuItemsInserted,
  });

  return {
    restaurantsInserted: FRANCA_RESTAURANTS.length,
    categoriesInserted: FRANCA_CATEGORIES.length,
    coverageCityInserted: existingCoverage.length === 0,
    branchesInserted,
    menuItemsInserted,
    skipped: false,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedFrancaDev(true)
    .then((result) => {
      logger.info('Seed result', result as unknown as Record<string, unknown>);
      process.exit(0);
    })
    .catch((err: unknown) => {
      logger.error('Seed failed', { error: err instanceof Error ? err.message : String(err) });
      process.exit(1);
    });
}
