export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  imageUrl: string;
  bannerUrl: string;
  isFeatured?: boolean;
  distance: string;
  promotionalOffer?: string;
  city?: string;
  neighborhood?: string;
  address?: string;
  phone?: string;
  paymentMethods?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
  additives?: Additive[];
}

export interface Additive {
  id: string;
  name: string;
  price: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

export const categories: Category[] = [
  { id: '1', name: 'Pizza', icon: '\u{1F355}', slug: 'pizza' },
  { id: '2', name: 'Hamb�rguer', icon: '\u{1F354}', slug: 'hamburger' },
  { id: '3', name: 'Sushi', icon: '\u{1F363}', slug: 'sushi' },
  { id: '4', name: 'Brasileira', icon: '\u{1F356}', slug: 'brazilian' },
  { id: '5', name: 'Italiana', icon: '\u{1F35D}', slug: 'italian' },
  { id: '6', name: 'Asi�tica', icon: '\u{1F961}', slug: 'asian' },
  { id: '7', name: 'Mexicana', icon: '\u{1F32E}', slug: 'mexican' },
  { id: '8', name: 'Doces', icon: '\u{1F370}', slug: 'desserts' },
  { id: '9', name: 'Bebidas', icon: '\u{1F964}', slug: 'drinks' },
  { id: '10', name: 'Saud�vel', icon: '\u{1F957}', slug: 'healthy' },
];

// Coordenadas reais dos bairros
const COORDS = {
  // Franca - Zona Leste
  JD_DERMINIO:         { lat: -20.5320, lng: -47.3990 },
  SAO_JOAQUIM:         { lat: -20.5220, lng: -47.4050 },
  VILA_SANTA_HELENA:   { lat: -20.5200, lng: -47.4080 },
  SANTA_EFIGENIA:      { lat: -20.5280, lng: -47.4140 },
  VILA_REZENDE:        { lat: -20.5300, lng: -47.4000 },
  JD_AEROPORTO_I:      { lat: -20.5400, lng: -47.3850 },
  JD_AEROPORTO_II:     { lat: -20.5380, lng: -47.3820 },
  JD_AEROPORTO_III:    { lat: -20.5360, lng: -47.3780 },
  JD_MARIA_ROSA:       { lat: -20.5450, lng: -47.4150 },
  VILA_SANTOS_DUMONT:  { lat: -20.5350, lng: -47.3750 },
  JD_BOA_ESPERANCA:    { lat: -20.5500, lng: -47.3900 },
  PROL_JD_LIMA:        { lat: -20.5550, lng: -47.4180 },
  JD_EDEN:             { lat: -20.5480, lng: -47.4220 },
  VILA_CHICO_JULIO:    { lat: -20.5400, lng: -47.4250 },
  VILA_NSSA_SENHORA_GRACAS: { lat: -20.5350, lng: -47.4300 },
  CENTRO:              { lat: -20.5350, lng: -47.4030 },
  JD_BARAO:            { lat: -20.5300, lng: -47.4350 },
  JD_NOEMIA:           { lat: -20.5450, lng: -47.4250 },
  PARQUE_VICENTE_LEPORACE: { lat: -20.5400, lng: -47.4320 },
  DISTRITO_INDUSTRIAL: { lat: -20.5300, lng: -47.4400 },
  VILA_SANTA_TEREZINHA:{ lat: -20.5250, lng: -47.4200 },

  // Ribeir�o Preto
  RP_CENTRO:           { lat: -21.1775, lng: -47.8102 },
  RP_JD_IPIRANGA:      { lat: -21.1800, lng: -47.8150 },
};

export const restaurants: Restaurant[] = [
  // ---------------------------------------
  // FRANCA - 21 bairros
  // ---------------------------------------

  // 1. Jardim Derm�nio
  {
    id: '1',
    name: 'Pizza Brescian',
    description: 'Pizzas artesanais com massa fermentada por 48h',
    cuisine: 'Pizza',
    rating: 4.8,
    reviewCount: 2341,
    deliveryTime: '30-40 min',
    deliveryFee: 5.90,
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=300&fit=crop',

    isFeatured: true,
    distance: '1.2 km',
    promotionalOffer: 'Frete gr�tis',
    city: 'Franca',
    neighborhood: 'Jardim Derm�nio',
    address: 'R. Alm. Tamandar�, 250 - Jardim Derm�nio',
    phone: '(16) 3722-1234',
    paymentMethods: 'Cart�o, Pix, Dinheiro',
    coordinates: COORDS.JD_DERMINIO,
  },

  // 2. S�o Joaquim
  {
    id: '2',
    name: 'Burger King',
    description: 'O hamb�rguer feito do seu jeito',
    cuisine: 'Hamb�rguer',
    rating: 4.5,
    reviewCount: 5621,
    deliveryTime: '20-30 min',
    deliveryFee: 4.90,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=300&fit=crop',

    distance: '0.8 km',
    city: 'Franca',
    neighborhood: 'S�o Joaquim',
    address: 'Av. Major Nic�cio, 1200 - S�o Joaquim',
    phone: '(16) 3724-5678',
    paymentMethods: 'Cart�o, Pix',
    coordinates: COORDS.SAO_JOAQUIM,
  },

  // 3. Vila Santa Helena
  {
    id: '3',
    name: 'Sushi House',
    description: 'Sushi fresco preparado na hora',
    cuisine: 'Sushi',
    rating: 4.9,
    reviewCount: 1823,
    deliveryTime: '35-45 min',
    deliveryFee: 7.90,
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=300&fit=crop',

    isFeatured: true,
    distance: '2.1 km',
    city: 'Franca',
    neighborhood: 'Vila Santa Helena',
    address: 'R. Dr. Albuquerque Lins, 890 - Vila Santa Helena',
    phone: '(16) 3725-4321',
    paymentMethods: 'Cart�o, Pix, Dinheiro',
    coordinates: COORDS.VILA_SANTA_HELENA,
  },

  // 4. Santa Efig�nia
  {
    id: '4',
    name: 'Churrascaria Ga�cha',
    description: 'Aut�ntica comida ga�cha com churrasco de fogo de ch�o',
    cuisine: 'Brasileira',
    rating: 4.7,
    reviewCount: 945,
    deliveryTime: '40-50 min',
    deliveryFee: 8.90,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=300&fit=crop',

    distance: '3.5 km',
    city: 'Franca',
    neighborhood: 'Santa Efig�nia',
    address: 'R. Volunt. Raimundo Nonato, 450 - Santa Efig�nia',
    phone: '(16) 3723-7890',
    paymentMethods: 'Cart�o, Pix, Dinheiro',
    coordinates: COORDS.SANTA_EFIGENIA,
  },

  // 5. Vila Rezende
  {
    id: '5',
    name: "McDonald's",
    description: 'Everybody\'s Favorite',
    cuisine: 'Hamb�rguer',
    rating: 4.3,
    reviewCount: 8921,
    deliveryTime: '15-25 min',
    deliveryFee: 3.90,
    imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&h=300&fit=crop',

    distance: '0.5 km',
    promotionalOffer: '10% OFF',
    city: 'Franca',
    neighborhood: 'Vila Rezende',
    address: 'Av. Rio Branco, 567 - Vila Rezende',
    phone: '(16) 3724-1111',
    paymentMethods: 'Cart�o, Pix',
    coordinates: COORDS.VILA_REZENDE,
  },

  // 6. Jardim Maria Rosa
  {
    id: '6',
    name: 'China in Box',
    description: 'Comida chinesa aut�ntica',
    cuisine: 'Asi�tica',
    rating: 4.6,
    reviewCount: 2103,
    deliveryTime: '25-35 min',
    deliveryFee: 5.50,
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&h=300&fit=crop',

    distance: '1.8 km',
    city: 'Franca',
    neighborhood: 'Jardim Maria Rosa',
    address: 'R. Doutor Juli�o Cardoso, 310 - Jardim Maria Rosa',
    phone: '(16) 3726-2233',
    paymentMethods: 'Cart�o, Pix, Dinheiro',
    coordinates: COORDS.JD_MARIA_ROSA,
  },

  // 7. Jardim Aeroporto I
  {
    id: '7',
    name: 'Aero Burguer',
    description: 'Lanches artesanais com blend da casa',
    cuisine: 'Hamb�rguer',
    rating: 4.4,
    reviewCount: 812,
    deliveryTime: '25-40 min',
    deliveryFee: 4.90,
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=300&fit=crop',

    distance: '2.5 km',
    city: 'Franca',
    neighborhood: 'Jardim Aeroporto I',
    address: 'Av. Santos Dumont, 800 - Jardim Aeroporto I',
    phone: '(16) 3727-3344',
    paymentMethods: 'Cart�o, Pix',
    coordinates: COORDS.JD_AEROPORTO_I,
  },

  // 8. Jardim Aeroporto II
  {
    id: '8',
    name: 'Pizzaria Roma',
    description: 'Pizzas no forno a lenha desde 1998',
    cuisine: 'Pizza',
    rating: 4.6,
    reviewCount: 1543,
    deliveryTime: '30-40 min',
    deliveryFee: 4.90,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=300&fit=crop',

    distance: '2.5 km',
    city: 'Franca',
    neighborhood: 'Jardim Aeroporto II',
    address: 'R. Ant�nio Derm�nio, 450 - Jardim Aeroporto II',
    phone: '(16) 3727-4455',
    paymentMethods: 'Cart�o, Pix, Dinheiro',
    coordinates: COORDS.JD_AEROPORTO_II,
  },

  // 9. Jardim Aeroporto III
  {
    id: '9',
    name: 'Japa Sushi Bar',
    description: 'Sushi e sashimi com ingredientes premium',
    cuisine: 'Sushi',
    rating: 4.5,
    reviewCount: 678,
    deliveryTime: '40-50 min',
    deliveryFee: 7.90,
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=300&fit=crop',

    distance: '3.0 km',
    city: 'Franca',
    neighborhood: 'Jardim Aeroporto III',
    address: 'Av. C�sar Martins Piraj�, 150 - Jardim Aeroporto III',
    phone: '(16) 3727-5566',
    paymentMethods: 'Cart�o, Pix, Dinheiro',
    coordinates: COORDS.JD_AEROPORTO_III,
  },

  // 10. Vila Santos Dumont
  {
    id: '10',
    name: 'Restaurante Vila Velha',
    description: 'Comida caseira com buffet livre',
    cuisine: 'Brasileira',
    rating: 4.4,
    reviewCount: 812,
    deliveryTime: '35-45 min',
    deliveryFee: 6.90,
    imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=300&fit=crop',

    distance: '2.0 km',
    city: 'Franca',
    neighborhood: 'Vila Santos Dumont',
    address: 'R. Danilo Meleti Soares, 320 - Vila Santos Dumont',
    phone: '(16) 3727-6677',
    paymentMethods: 'Cart�o, Dinheiro',
    coordinates: COORDS.VILA_SANTOS_DUMONT,
  },

  // 11. Jardim Boa Esperan�a
  {
    id: '11',
    name: 'Cantina Bella Napoli',
    description: 'Massas artesanais e vinhos selecionados',
    cuisine: 'Italiana',
    rating: 4.7,
    reviewCount: 1205,
    deliveryTime: '40-55 min',
    deliveryFee: 6.90,
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=300&fit=crop',

    distance: '3.8 km',
    city: 'Franca',
    neighborhood: 'Jardim Boa Esperan�a',
    address: 'R. Carolina Piacezzi Tardivo, 600 - Jardim Boa Esperan�a',
    phone: '(16) 3728-7788',
    paymentMethods: 'Cart�o, Pix, Dinheiro',
    coordinates: COORDS.JD_BOA_ESPERANCA,
  },

  // 12. Prolongamento Jardim Lima
  {
    id: '12',
    name: 'Emp�rio do A�a�',
    description: 'A�a� na tigela e sucos naturais',
    cuisine: 'Doces',
    rating: 4.6,
    reviewCount: 2340,
    deliveryTime: '20-30 min',
    deliveryFee: 0,
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=300&fit=crop',

    distance: '4.0 km',
    promotionalOffer: 'Frete gr�tis',
    city: 'Franca',
    neighborhood: 'Prolongamento Jardim Lima',
    address: 'R. Alely Antunes de Paula, 120 - Prolongamento Jardim Lima',
    phone: '(16) 3728-8899',
    paymentMethods: 'Cart�o, Pix',
    coordinates: COORDS.PROL_JD_LIMA,
  },

  // 13. Jardim do �den
  {
    id: '13',
    name: 'Espa�o Verde Restaurante',
    description: 'Comida saud�vel com op��es veganas e sem gl�ten',
    cuisine: 'Saud�vel',
    rating: 4.5,
    reviewCount: 987,
    deliveryTime: '30-45 min',
    deliveryFee: 4.90,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=300&fit=crop',

    isFeatured: true,
    distance: '5.0 km',
    city: 'Franca',
    neighborhood: 'Jardim do �den',
    address: 'R. Agnelo Vila�a, 200 - Jardim do �den',
    phone: '(16) 3728-9900',
    paymentMethods: 'Cart�o, Pix',
    coordinates: COORDS.JD_EDEN,
  },

  // 14. Vila Chico J�lio
  {
    id: '14',
    name: 'Tacos El Mexicano',
    description: 'Tacos aut�nticos mexicanos com guacamole fresco',
    cuisine: 'Mexicana',
    rating: 4.3,
    reviewCount: 567,
    deliveryTime: '35-50 min',
    deliveryFee: 5.90,
    imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4c?w=400&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4c?w=800&h=300&fit=crop',

    distance: '5.2 km',
    city: 'Franca',
    neighborhood: 'Vila Chico J�lio',
    address: 'R. Orestes Trist�o, 800 - Vila Chico J�lio',
    phone: '(16) 3729-0011',
    paymentMethods: 'Cart�o, Pix, Dinheiro',
    coordinates: COORDS.VILA_CHICO_JULIO,
  },

  // 15. Vila Nossa Senhora das Gra�as
  {
    id: '15',
    name: 'Sorveteria La Frutta',
    description: 'Sorvetes artesanais com frutas da esta��o',
    cuisine: 'Doces',
    rating: 4.8,
    reviewCount: 3450,
    deliveryTime: '25-35 min',
    deliveryFee: 0,
    imageUrl: 'https://images.unsplash.com/photo-1597108884103-11351d1eb768?w=400&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1597108884103-11351d1eb768?w=800&h=300&fit=crop',

    distance: '5.8 km',
    promotionalOffer: '2 sabores por R$15',
    city: 'Franca',
    neighborhood: 'Vila Nossa Senhora das Gra�as',
    address: 'R. Governador J�lio Prestes, 50 - Vila Nossa Senhora das Gra�as',
    phone: '(16) 3729-1122',
    paymentMethods: 'Cart�o, Pix',
    coordinates: COORDS.VILA_NSSA_SENHORA_GRACAS,
  },

  // 16. Centro
  {
    id: '16',
    name: 'Restaurante Central',
    description: 'Tradicional restaurante do centro com comida caseira',
    cuisine: 'Brasileira',
    rating: 4.2,
    reviewCount: 1654,
    deliveryTime: '25-40 min',
    deliveryFee: 5.90,
    imageUrl: 'https://images.unsplash.com/photo-1524423955758-5e3b1a2c4e15?w=400&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1524423955758-5e3b1a2c4e15?w=800&h=300&fit=crop',

    distance: '1.5 km',
    city: 'Franca',
    neighborhood: 'Centro',
    address: 'R. General Carneiro, 500 - Centro',
    phone: '(16) 3721-3344',
    paymentMethods: 'Cart�o, Pix, Dinheiro',
    coordinates: COORDS.CENTRO,
  },

  // 17. Jardim Bar�o
  {
    id: '17',
    name: 'Boteco do Z�',
    description: 'Petiscos e chopes gelados no melhor estilo boteco',
    cuisine: 'Brasileira',
    rating: 4.2,
    reviewCount: 2100,
    deliveryTime: '35-50 min',
    deliveryFee: 3.90,
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&h=300&fit=crop',

    distance: '7.5 km',
    city: 'Franca',
    neighborhood: 'Jardim Bar�o',
    address: 'R. Presidente Carlos Coimbra da Luz, 300 - Jardim Bar�o',
    phone: '(16) 3729-2233',
    paymentMethods: 'Cart�o, Dinheiro',
    coordinates: COORDS.JD_BARAO,
  },

  // 18. Jardim No�mia
  {
    id: '18',
    name: 'Fast Grill',
    description: 'Grelhados r�pidos com salada self-service',
    cuisine: 'Brasileira',
    rating: 4.0,
    reviewCount: 1780,
    deliveryTime: '20-30 min',
    deliveryFee: 3.90,
    imageUrl: 'https://images.unsplash.com/photo-1556157382-97eda1d865d6?w=400&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1556157382-97eda1d865d6?w=800&h=300&fit=crop',

    distance: '8.2 km',
    city: 'Franca',
    neighborhood: 'Jardim No�mia',
    address: 'Av. Doutor Chafic Facury, 1200 - Jardim No�mia',
    phone: '(16) 3729-3344',
    paymentMethods: 'Cart�o, Pix',
    coordinates: COORDS.JD_NOEMIA,
  },

  // 19. Parque Vicente Leporace
  {
    id: '19',
    name: 'Caf� do Parque',
    description: 'Caf� especial e brunchs artesanais',
    cuisine: 'Cafe',
    rating: 4.6,
    reviewCount: 1432,
    deliveryTime: '25-35 min',
    deliveryFee: 0,
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=300&fit=crop',

    distance: '9.0 km',
    promotionalOffer: 'Frete gr�tis',
    city: 'Franca',
    neighborhood: 'Parque Vicente Leporace',
    address: 'Av. Orlando Dompieri, 1500 - Parque Vicente Leporace',
    phone: '(16) 3729-4455',
    paymentMethods: 'Cart�o, Pix',
    coordinates: COORDS.PARQUE_VICENTE_LEPORACE,
  },

  // 20. Distrito Industrial
  {
    id: '20',
    name: 'Distrito Gourmet',
    description: 'Food truck com op��es variadas para o trabalhador',
    cuisine: 'Fast food',
    rating: 4.1,
    reviewCount: 890,
    deliveryTime: '30-45 min',
    deliveryFee: 4.90,
    imageUrl: 'https://images.unsplash.com/photo-1556157382-97eda1d865d6?w=400&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1556157382-97eda1d865d6?w=800&h=300&fit=crop',

    distance: '11.5 km',
    city: 'Franca',
    neighborhood: 'Distrito Industrial',
    address: 'Av. Elias Limonta, 2000 - Distrito Industrial',
    phone: '(16) 3729-5566',
    paymentMethods: 'Dinheiro, Pix',
    coordinates: COORDS.DISTRITO_INDUSTRIAL,
  },

  // 21. Vila Santa Terezinha
  {
    id: '21',
    name: 'Restaurante Bom Gosto',
    description: 'Alimenta��o saud�vel com op��es fitness',
    cuisine: 'Saud�vel',
    rating: 4.5,
    reviewCount: 987,
    deliveryTime: '30-45 min',
    deliveryFee: 4.90,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=300&fit=crop',

    distance: '6.0 km',
    city: 'Franca',
    neighborhood: 'Vila Santa Terezinha',
    address: 'R. Princesa Isabel, 700 - Vila Santa Terezinha',
    phone: '(16) 3729-6677',
    paymentMethods: 'Cart�o, Pix, Dinheiro',
    coordinates: COORDS.VILA_SANTA_TEREZINHA,
  },

  // ---------------------------------------
  // RIBEIR�O PRETO - 2 bairros
  // ---------------------------------------

  // 22. Ribeir�o Preto - Centro
  {
    id: '22',
    name: 'Trattoria D\'Angelo',
    description: 'Culin�ria italiana aut�ntica com massas frescas',
    cuisine: 'Italiana',
    rating: 4.7,
    reviewCount: 3120,
    deliveryTime: '35-50 min',
    deliveryFee: 7.90,
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=300&fit=crop',

    isFeatured: true,
    distance: '0.0 km',
    city: 'Ribeir�o Preto',
    neighborhood: 'Centro',
    address: 'R. Visconde de Inha�ma, 589 - Centro, Ribeir�o Preto',
    phone: '(16) 3610-1234',
    paymentMethods: 'Cart�o, Pix, Dinheiro',
    coordinates: COORDS.RP_CENTRO,
  },

  // 23. Ribeir�o Preto - Jardim Ipiranga
  {
    id: '23',
    name: 'Sakura Temakeria',
    description: 'Temakeria e culin�ria japonesa contempor�nea',
    cuisine: 'Sushi',
    rating: 4.6,
    reviewCount: 2340,
    deliveryTime: '30-45 min',
    deliveryFee: 5.90,
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=300&fit=crop',

    distance: '0.0 km',
    city: 'Ribeir�o Preto',
    neighborhood: 'Jardim Ipiranga',
    address: 'Av. Nove de Julho, 2450 - Jardim Ipiranga, Ribeir�o Preto',
    phone: '(16) 3611-5678',
    paymentMethods: 'Cart�o, Pix, Dinheiro',
    coordinates: COORDS.RP_JD_IPIRANGA,
  },
];

export const menuItems: MenuItem[] = [
  // -- ID 1: Pizza Brescian --
  {
    id: 'm1', restaurantId: '1',
    name: 'Pizza Margherita',
    description: 'Molho de tomate italiano, mussarela de bufala, manjeric�o fresco',
    price: 45.90, originalPrice: 55.90,
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop',
    category: 'Pizzas', isAvailable: true,
    additives: [{ id: 'a1', name: 'Borda Recheada', price: 8.90 }],
  },
  {
    id: 'm2', restaurantId: '1',
    name: 'Pizza Calabresa',
    description: 'Mussarela, calabresa defumada e cebola',
    price: 42.90,
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop',
    category: 'Pizzas', isAvailable: true,
  },
  {
    id: 'm3', restaurantId: '1',
    name: 'Pizza Quatro Queijos',
    description: 'Mussarela, gorgonzola, provolone e parmes�o',
    price: 49.90,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    category: 'Pizzas', isAvailable: true,
  },
  {
    id: 'm4', restaurantId: '1',
    name: 'Refrigerante Lata 350ml',
    description: 'Coca-Cola, Guaran� Antarctica ou Fanta',
    price: 5.90,
    imageUrl: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop',
    category: 'Bebidas', isAvailable: true,
  },
  {
    id: 'm5', restaurantId: '1',
    name: 'Petit G�teau',
    description: 'Bolinho de chocolate com sorvete de creme',
    price: 22.90,
    imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop',
    category: 'Sobremesas', isAvailable: true,
  },

  // -- ID 2: Burger King --
  {
    id: 'm6', restaurantId: '2',
    name: 'Whopper',
    description: '100g de carne grelhada, alface, tomate, cebola, picles e maionese',
    price: 29.90,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    category: 'Lanches', isAvailable: true,
    additives: [
      { id: 'a2', name: 'Bacon Extra', price: 4.90 },
      { id: 'a3', name: 'Queijo Extra', price: 3.90 },
    ],
  },
  {
    id: 'm7', restaurantId: '2',
    name: 'Chicken Crisp',
    description: 'Fil� de frango empanado com alface e maionese',
    price: 26.90,
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop',
    category: 'Lanches', isAvailable: true,
  },
  {
    id: 'm8', restaurantId: '2',
    name: 'Batata Frita M�dia',
    description: 'Batata sequinha e crocante',
    price: 12.90,
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
    category: 'Acompanhamentos', isAvailable: true,
  },
  {
    id: 'm9', restaurantId: '2',
    name: 'Milk Shake Chocolate',
    description: 'Milk shake cremoso de chocolate 400ml',
    price: 18.90,
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop',
    category: 'Bebidas', isAvailable: true,
  },

  // -- ID 3: Sushi House --
  {
    id: 'm10', restaurantId: '3',
    name: 'Combinado Especial 30 pe�as',
    description: 'Salm�o, atum, kani, camar�o e peixe branco',
    price: 89.90,
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
    category: 'Combinados', isAvailable: true,
  },
  {
    id: 'm11', restaurantId: '3',
    name: 'Uramaki Filad�lfia 8 pe�as',
    description: 'Salm�o cream cheese e cebolinha',
    price: 32.90,
    imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
    category: 'Uramaki', isAvailable: true,
  },
  {
    id: 'm12', restaurantId: '3',
    name: 'Hot Roll 8 pe�as',
    description: 'Salm�o empanado com cream cheese',
    price: 28.90,
    imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
    category: 'Hot Roll', isAvailable: true,
  },
  {
    id: 'm13', restaurantId: '3',
    name: 'Sashimi Salm�o 10 fatias',
    description: 'Salm�o fresco cortado � m�o',
    price: 42.90,
    imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
    category: 'Sashimi', isAvailable: true,
  },
  {
    id: 'm14', restaurantId: '3',
    name: 'Temaki Salm�o',
    description: 'Cone de alga com salm�o e cream cheese',
    price: 24.90,
    imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
    category: 'Temaki', isAvailable: true,
  },

  // -- ID 4: Churrascaria Ga�cha --
  {
    id: 'm15', restaurantId: '4',
    name: 'Picanha na chapa',
    description: 'Picanha fatiada servida na chapa com farofa e vinagrete',
    price: 68.90,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    category: 'Carnes', isAvailable: true,
  },
  {
    id: 'm16', restaurantId: '4',
    name: 'Costela no bafo',
    description: 'Costela bovina assada lentamente por 8h',
    price: 59.90,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    category: 'Carnes', isAvailable: true,
  },
  {
    id: 'm17', restaurantId: '4',
    name: 'Frango grelhado com legumes',
    description: 'Peito de frango grelhado com legumes na manteiga',
    price: 42.90,
    imageUrl: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=300&fit=crop',
    category: 'Grelhados', isAvailable: true,
  },
  {
    id: 'm18', restaurantId: '4',
    name: 'Arroz carreteiro',
    description: 'Arroz com carne seca desfiada e temperos',
    price: 28.90,
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
    category: 'Acompanhamentos', isAvailable: true,
  },

  // -- ID 5: McDonald's --
  {
    id: 'm19', restaurantId: '5',
    name: 'Big Mac',
    description: 'Dois hamb�rgueres, alface, queijo, molho especial, cebola e picles',
    price: 34.90,
    imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop',
    category: 'Lanches', isAvailable: true,
  },
  {
    id: 'm20', restaurantId: '5',
    name: 'McChicken',
    description: 'Sandu�che de frango empanado com maionese',
    price: 28.90,
    imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop',
    category: 'Lanches', isAvailable: true,
  },
  {
    id: 'm21', restaurantId: '5',
    name: 'McFritas Grande',
    description: 'Batata frita crocante por��o grande',
    price: 14.90,
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
    category: 'Acompanhamentos', isAvailable: true,
  },
  {
    id: 'm22', restaurantId: '5',
    name: 'McShake Ovomaltine',
    description: 'Milk shake de ovomaltine 400ml',
    price: 16.90,
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop',
    category: 'Bebidas', isAvailable: true,
  },

  // -- ID 7: Aero Burguer --
  {
    id: 'm23', restaurantId: '7',
    name: 'X-Tudo',
    description: 'Hamb�rguer artesanal, bacon, ovo, queijo, alface e tomate',
    price: 32.90,
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop',
    category: 'Lanches', isAvailable: true,
  },
  {
    id: 'm24', restaurantId: '7',
    name: 'X-Salada',
    description: 'Hamb�rguer artesanal com queijo, alface e tomate',
    price: 26.90,
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop',
    category: 'Lanches', isAvailable: true,
  },
  {
    id: 'm25', restaurantId: '7',
    name: 'Batata com Cheddar',
    description: 'Batata frita coberta com cheddar cremoso e bacon',
    price: 24.90,
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
    category: 'Acompanhamentos', isAvailable: true,
  },

  // -- ID 8: Pizzaria Roma --
  {
    id: 'm26', restaurantId: '8',
    name: 'Pizza Portuguesa',
    description: 'Mussarela, presunto, ovos, cebola, piment�o e azeitona',
    price: 48.90,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    category: 'Pizzas', isAvailable: true,
  },
  {
    id: 'm27', restaurantId: '8',
    name: 'Pizza Frango c/ Catupiry',
    description: 'Frango desfiado com catupiry',
    price: 46.90,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    category: 'Pizzas', isAvailable: true,
  },
  {
    id: 'm28', restaurantId: '8',
    name: 'Coca-Cola 2L',
    description: 'Refrigerante Coca-Cola 2 litros',
    price: 10.90,
    imageUrl: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop',
    category: 'Bebidas', isAvailable: true,
  },

  // -- ID 11: Cantina Bella Napoli --
  {
    id: 'm29', restaurantId: '11',
    name: 'Spaghetti � Carbonara',
    description: 'Massa fresca com bacon, ovos, parmes�o e pimenta negra',
    price: 46.90,
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    category: 'Massas', isAvailable: true,
  },
  {
    id: 'm30', restaurantId: '11',
    name: 'Risoto ao Funghi',
    description: 'Arroz arb�reo com cogumelos porcini e parmes�o',
    price: 52.90,
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    category: 'Risotos', isAvailable: true,
  },
  {
    id: 'm31', restaurantId: '11',
    name: 'Lasanha � Bolonhesa',
    description: 'Massas intercaladas com molho bolonhesa e bechamel',
    price: 48.90,
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    category: 'Massas', isAvailable: true,
  },
  {
    id: 'm32', restaurantId: '11',
    name: 'Tiramisu',
    description: 'Sobremesa italiana cl�ssica com caf� e mascarpone',
    price: 24.90,
    imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop',
    category: 'Sobremesas', isAvailable: true,
  },

  // -- ID 14: Tacos El Mexicano --
  {
    id: 'm33', restaurantId: '14',
    name: 'Taco de Carne',
    description: 'Tortilha com carne mo�da temperada, alface, queijo e molho especial',
    price: 28.90,
    imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4c?w=400&h=300&fit=crop',
    category: 'Tacos', isAvailable: true,
  },
  {
    id: 'm34', restaurantId: '14',
    name: 'Burrito de Frango',
    description: 'Tortilha grande com frango, arroz, feij�o e guacamole',
    price: 34.90,
    imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4c?w=400&h=300&fit=crop',
    category: 'Burritos', isAvailable: true,
  },
  {
    id: 'm35', restaurantId: '14',
    name: 'Guacamole com Nachos',
    description: 'Guacamole fresco servido com nachos crocantes',
    price: 22.90,
    imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4c?w=400&h=300&fit=crop',
    category: 'Entradas', isAvailable: true,
  },
  {
    id: 'm36', restaurantId: '14',
    name: 'Churros Mexicanos',
    description: 'Churros recheados com doce de leite e canela',
    price: 18.90,
    imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop',
    category: 'Sobremesas', isAvailable: true,
  },

  // -- ID 22: Trattoria D'Angelo (Ribeir�o Preto) --
  {
    id: 'm37', restaurantId: '22',
    name: 'Fettuccine Alfredo',
    description: 'Massa fresca com molho branco cremoso e parmes�o',
    price: 49.90,
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    category: 'Massas', isAvailable: true,
  },
  {
    id: 'm38', restaurantId: '22',
    name: 'Pizza Margherita D\'Angelo',
    description: 'Mussarela de bufala, tomate pelatti e manjeric�o',
    price: 54.90,
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
    category: 'Pizzas', isAvailable: true,
  },
  {
    id: 'm39', restaurantId: '22',
    name: 'Bruschetta Classica',
    description: 'P�o italiano com tomate, azeite e manjeric�o',
    price: 26.90,
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    category: 'Entradas', isAvailable: true,
  },
  {
    id: 'm40', restaurantId: '22',
    name: 'Vinho Tinto Casa',
    description: 'Ta�a de vinho tinto da casa (175ml)',
    price: 18.90,
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop',
    category: 'Bebidas', isAvailable: true,
  },
  {
    id: 'm41', restaurantId: '22',
    name: 'Cannoli Siciliano',
    description: 'Massa crocante recheada com ricota e pistache',
    price: 24.90,
    imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop',
    category: 'Sobremesas', isAvailable: true,
  },

  // -- ID 23: Sakura Temakeria (Ribeir�o Preto) --
  {
    id: 'm42', restaurantId: '23',
    name: 'Combinado Sakura 20 pe�as',
    description: 'Sele��o do chef com salm�o, atum e robalo',
    price: 68.90,
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
    category: 'Combinados', isAvailable: true,
  },
  {
    id: 'm43', restaurantId: '23',
    name: 'Temaki Salm�o Filad�lfia',
    description: 'Cone de alga com salm�o fresco e cream cheese',
    price: 26.90,
    imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
    category: 'Temaki', isAvailable: true,
  },
  {
    id: 'm44', restaurantId: '23',
    name: 'Tempur� de Legumes',
    description: 'Legumes empanados na massa tempur�',
    price: 28.90,
    imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
    category: 'Entradas', isAvailable: true,
  },
  {
    id: 'm45', restaurantId: '23',
    name: 'Sake (Salm�o) 8 fatias',
    description: 'Salm�o fresco cortado � m�o',
    price: 38.90,
    imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
    category: 'Sashimi', isAvailable: true,
  },
  {
    id: 'm46', restaurantId: '23',
    name: 'Green Tea Ice Cream',
    description: 'Sorvete de ch� verde matcha',
    price: 16.90,
    imageUrl: 'https://images.unsplash.com/photo-1597108884103-11351d1eb768?w=400&h=300&fit=crop',
    category: 'Sobremesas', isAvailable: true,
  },
];