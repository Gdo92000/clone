import type { MerchantCompany } from 'src/domain/entities/Company';

export const mockCompanies: MerchantCompany[] = [
  { id: 'comp-1', name: 'Burger House Ltda', document: '12.345.678/0001-90', plan: 'pro' },
  { id: 'comp-2', name: 'Sakura Sushi Ltda', document: '98.765.432/0001-10', plan: 'premium' },
  { id: 'comp-3', name: 'Dona Maria Refeições', document: '11.111.111/0001-11', plan: 'basic' },
  { id: 'comp-4', name: 'Bahia Lanches - Franca', document: '33.444.555/0001-22', plan: 'basic' },
];
