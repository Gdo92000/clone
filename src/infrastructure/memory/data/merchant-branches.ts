import type { MerchantBranch } from 'src/domain/entities/Company';

export const mockBranches: MerchantBranch[] = [
  { id: 'branch-1', companyId: 'comp-1', name: 'Burger House - Centro', city: 'São Paulo', state: 'SP', cep: '', address: 'Rua Augusta, 500', number: '', neighborhood: '', deliveryRadiusKm: 5 },
  { id: 'branch-2', companyId: 'comp-1', name: 'Burger House - Vila Olímpia', city: 'São Paulo', state: 'SP', cep: '', address: 'Av. Faria Lima, 1500', number: '', neighborhood: '', deliveryRadiusKm: 4 },
  { id: 'branch-3', companyId: 'comp-2', name: 'Sakura Sushi - Liberdade', city: 'São Paulo', state: 'SP', cep: '', address: 'Rua Galvão Bueno, 200', number: '', neighborhood: '', deliveryRadiusKm: 6 },
  { id: 'branch-4', companyId: 'comp-3', name: 'Dona Maria - Mooca', city: 'São Paulo', state: 'SP', cep: '', address: 'Rua da Mooca, 1000', number: '', neighborhood: '', deliveryRadiusKm: 3 },
  { id: 'branch-5', companyId: 'comp-4', name: 'Bahia Lanches - Franca', city: 'Franca', state: 'SP', cep: '', address: 'Av. Min. Rui Barbosa, 1965 - Vila Rezende', number: '', neighborhood: 'Vila Rezende', deliveryRadiusKm: 5 },
];
