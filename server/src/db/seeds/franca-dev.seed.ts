import { eq, inArray } from 'drizzle-orm';
import { db } from '../index';
import { restaurants, categories, coverageCities } from '../schema';
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

export interface SeedFrancaDevResult {
  restaurantsInserted: number;
  categoriesInserted: number;
  coverageCityInserted: boolean;
  skipped: boolean;
}

export async function seedFrancaDev(force = false): Promise<SeedFrancaDevResult> {
  logger.info('🌱 Seed Franca Dev: verificando estado do banco');

  const existing = await db.select({ id: restaurants.id }).from(restaurants).limit(1);
  if (existing.length > 0 && !force) {
    logger.info('⏭️ Seed Franca Dev: banco já possui restaurants, pulando', { existing: existing.length });
    return { restaurantsInserted: 0, categoriesInserted: 0, coverageCityInserted: false, skipped: true };
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

  logger.info('✅ Seed Franca Dev concluído', {
    restaurants: FRANCA_RESTAURANTS.length,
    categories: FRANCA_CATEGORIES.length,
    coverageCity: 'city-franca',
  });

  return {
    restaurantsInserted: FRANCA_RESTAURANTS.length,
    categoriesInserted: FRANCA_CATEGORIES.length,
    coverageCityInserted: existingCoverage.length === 0,
    skipped: false,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedFrancaDev(true)
    .then((result) => {
      logger.info('Seed result', result);
      process.exit(0);
    })
    .catch((err: unknown) => {
      logger.error('Seed failed', { error: err instanceof Error ? err.message : String(err) });
      process.exit(1);
    });
}
