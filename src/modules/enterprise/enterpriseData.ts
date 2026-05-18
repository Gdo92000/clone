import type { AuditEvent, DemoCategory, DemoCompanyProfile, DemoCustomer, DemoProduct } from './types';

export const demoCategories: DemoCategory[] = [
  { id: 'cat-mexican', name: 'Mexicana', cuisine: 'mexicana', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop', tags: ['picante', 'tacos'] },
  { id: 'cat-japanese', name: 'Japonesa', cuisine: 'japonesa', imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop', tags: ['sushi', 'leve'] },
  { id: 'cat-brazilian', name: 'Brasileira', cuisine: 'brasileira', imageUrl: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=600&h=400&fit=crop', tags: ['caseira'] },
  { id: 'cat-italian', name: 'Italiana', cuisine: 'italiana', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop', tags: ['pizza', 'massa'] },
  { id: 'cat-vegan', name: 'Vegana', cuisine: 'vegana', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop', tags: ['vegano', 'saudavel'] },
  { id: 'cat-burger', name: 'Hamburgueria', cuisine: 'hamburgueria', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop', tags: ['burger'] },
  { id: 'cat-dessert', name: 'Sobremesas', cuisine: 'sobremesas', imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&h=400&fit=crop', tags: ['doce'] },
  { id: 'cat-coffee', name: 'Cafeteria', cuisine: 'cafeteria', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=400&fit=crop', tags: ['cafe'] },
  { id: 'cat-arabic', name: 'Arabe', cuisine: 'arabe', imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&h=400&fit=crop', tags: ['kebab'] },
  { id: 'cat-healthy', name: 'Saudavel', cuisine: 'saudavel', imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&h=400&fit=crop', tags: ['fit'] },
  { id: 'cat-drinks', name: 'Bebidas', cuisine: 'bebidas', imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&h=400&fit=crop', tags: ['bebida'] },
];

export const demoCompanyProfiles: DemoCompanyProfile[] = [
  {
    companyId: 'company-1',
    logoUrl: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=240&h=240&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&h=420&fit=crop',
    commercialStatus: 'active',
  },
  {
    companyId: 'company-2',
    logoUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=240&h=240&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&h=420&fit=crop',
    commercialStatus: 'trial',
  },
];

export const demoProducts: DemoProduct[] = [
  {
    id: 'demo-prod-pizza-margherita',
    branchId: 'branch-1',
    categoryId: 'cat-italian',
    name: 'Pizza Margherita Especial',
    description: 'Mussarela, tomate, manjericao fresco e azeite.',
    imageUrl: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=700&h=500&fit=crop',
    basePrice: 45.9,
    available: true,
    tags: ['pizza', 'vegetariano'],
    options: [
      {
        id: 'size',
        name: 'Tamanho',
        min: 1,
        max: 1,
        values: [
          { id: 'medium', name: 'Media', priceDelta: 0 },
          { id: 'large', name: 'Grande', priceDelta: 12 },
        ],
      },
      {
        id: 'extras',
        name: 'Adicionais',
        min: 0,
        max: 3,
        values: [
          { id: 'cheese', name: 'Queijo extra', priceDelta: 6 },
          { id: 'olives', name: 'Azeitonas', priceDelta: 3 },
        ],
      },
    ],
  },
  {
    id: 'demo-prod-sushi-combo',
    branchId: 'branch-3',
    categoryId: 'cat-japanese',
    name: 'Combinado 24 pecas',
    description: 'Selecao de sashimi, uramaki, hossomaki e niguiri.',
    imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=700&h=500&fit=crop',
    basePrice: 72.9,
    available: true,
    tags: ['sushi', 'combo'],
    options: [
      {
        id: 'drink',
        name: 'Bebida do combo',
        min: 0,
        max: 1,
        values: [
          { id: 'water', name: 'Agua', priceDelta: 4 },
          { id: 'tea', name: 'Cha gelado', priceDelta: 7 },
        ],
      },
    ],
  },
  {
    id: 'demo-prod-taco',
    branchId: 'branch-1',
    categoryId: 'cat-mexican',
    name: 'Tacos Picantes',
    description: 'Tortilhas recheadas com carne, salsa e guacamole.',
    imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=700&h=500&fit=crop',
    basePrice: 36.9,
    available: false,
    tags: ['picante'],
    options: [
      {
        id: 'spice',
        name: 'Nivel de pimenta',
        min: 1,
        max: 1,
        values: [
          { id: 'mild', name: 'Suave', priceDelta: 0 },
          { id: 'hot', name: 'Forte', priceDelta: 0 },
        ],
      },
    ],
  },
];

export const demoCustomers: DemoCustomer[] = [
  {
    id: 'customer-1',
    userId: 'user-customer-1',
    name: 'Maria Fernanda',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop',
  },
];

export const auditEvents: AuditEvent[] = [
  {
    id: 'audit-1',
    actorId: 'user-superadmin',
    action: 'Ativou addon Analytics Pro',
    target: 'company-1',
    createdAt: '2026-05-10 09:20',
  },
  {
    id: 'audit-2',
    actorId: 'user-superadmin',
    action: 'Criou feature flag featured_home',
    target: 'branch-3',
    createdAt: '2026-05-10 09:28',
  },
];
