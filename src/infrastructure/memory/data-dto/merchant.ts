import type { MerchantCompanyDTO, MerchantBranchDTO, MerchantOrderDTO, MerchantMenuItemDTO, BranchSettingsDTO } from 'src/dto/merchantDto'
import type { MerchantCouponDTO, CampaignDTO } from 'src/dto/superadminDto'

export const mockCompanies: MerchantCompanyDTO[] = [
  { id: 'comp-1', name: 'Burger House Ltda', document: '12.345.678/0001-90', plan: 'pro' },
  { id: 'comp-2', name: 'Sakura Sushi Ltda', document: '98.765.432/0001-10', plan: 'premium' },
  { id: 'comp-3', name: 'Dona Maria Refeições', document: '11.111.111/0001-11', plan: 'basic' },
  { id: 'comp-4', name: 'Bahia Lanches - Franca', document: '33.444.555/0001-22', plan: 'basic' },
]

export const mockBranches: MerchantBranchDTO[] = [
  { id: 'branch-1', company_id: 'comp-1', name: 'Burger House - Centro', city: 'São Paulo', state: 'SP', address: 'Rua Augusta, 500', cep: '01304-001', number: '500', neighborhood: 'Consolação', latitude: -23.5505, longitude: -46.6333, delivery_radius_km: 5 },
  { id: 'branch-2', company_id: 'comp-1', name: 'Burger House - Vila Olímpia', city: 'São Paulo', state: 'SP', address: 'Av. Faria Lima, 1500', cep: '04538-132', number: '1500', neighborhood: 'Vila Olímpia', latitude: -23.5862, longitude: -46.6803, delivery_radius_km: 4 },
  { id: 'branch-3', company_id: 'comp-2', name: 'Sakura Sushi - Liberdade', city: 'São Paulo', state: 'SP', address: 'Rua Galvão Bueno, 200', cep: '01506-000', number: '200', neighborhood: 'Liberdade', latitude: -23.5587, longitude: -46.6342, delivery_radius_km: 6 },
  { id: 'branch-4', company_id: 'comp-3', name: 'Dona Maria - Mooca', city: 'São Paulo', state: 'SP', address: 'Rua da Mooca, 1000', cep: '03103-002', number: '1000', neighborhood: 'Mooca', latitude: -23.5629, longitude: -46.6011, delivery_radius_km: 3 },
  { id: 'branch-5', company_id: 'comp-4', name: 'Bahia Lanches - Franca', city: 'Franca', state: 'SP', address: 'Av. Min. Rui Barbosa, 1965 - Vila Rezende', cep: '14406-548', number: '1965', neighborhood: 'Vila Rezende', latitude: -20.5300, longitude: -47.4424, delivery_radius_km: 5 },
]

export const mockMerchantMenuItems: MerchantMenuItemDTO[] = [
  { id: 'm-item-1', branch_id: 'branch-1', name: 'X-Burger Clássico', category: 'Hambúrgueres', price: 28.90, is_available: true, description: 'Hambúrguer 180g, queijo, alface, tomate' },
  { id: 'm-item-2', branch_id: 'branch-1', name: 'X-Bacon Supreme', category: 'Hambúrgueres', price: 34.90, is_available: true, description: 'Hambúrguer 250g, bacon, cheddar' },
  { id: 'm-item-3', branch_id: 'branch-1', name: 'Batata Frita', category: 'Acompanhamentos', price: 12.90, is_available: true, description: 'Batata frita crocante' },
  { id: 'm-item-4', branch_id: 'branch-2', name: 'X-Burger Clássico', category: 'Hambúrgueres', price: 29.90, is_available: true, description: 'Hambúrguer 180g, queijo, alface, tomate' },
  { id: 'm-item-5', branch_id: 'branch-3', name: 'Sushi Combo 20 peças', category: 'Combinados', price: 54.90, is_available: true, description: '20 peças variadas' },
  { id: 'm-item-6', branch_id: 'branch-3', name: 'Temaki Salmão', category: 'Temakis', price: 18.90, is_available: true, description: 'Temaki de salmão fresco' },
  { id: 'm-item-7', branch_id: 'branch-4', name: 'Prato Feito', category: 'Executivos', price: 24.90, is_available: true, description: 'Arroz, feijão, bife acebolado, fritas' },
  { id: 'm-item-8', branch_id: 'branch-4', name: 'Strogonoff de Frango', category: 'Executivos', price: 28.90, is_available: false, description: 'Strogonoff de frango com arroz e batata palha' },
]

export const mockBranchSettings: BranchSettingsDTO[] = [
  { branch_id: 'branch-1', opening_time: '08:00', closing_time: '23:00', preparation_time: '20', minimum_order: '15.00', accepts_delivery: true, accepts_pickup: true, pix_key: 'burgerhouse@pix.com' },
  { branch_id: 'branch-2', opening_time: '09:00', closing_time: '22:00', preparation_time: '25', minimum_order: '20.00', accepts_delivery: true, accepts_pickup: true, pix_key: 'burgerhouse.vila@pix.com' },
  { branch_id: 'branch-3', opening_time: '10:00', closing_time: '22:30', preparation_time: '30', minimum_order: '25.00', accepts_delivery: true, accepts_pickup: false, pix_key: 'sakura@pix.com' },
]

export const mockOrders: MerchantOrderDTO[] = [
  { id: 'order-1', branch_id: 'branch-1', customer_name: 'Pedro Alves', customer_address: 'Rua Fernandes, 123', created_at: new Date().toISOString(), status: 'pending', payment_method: 'credit_card', delivery_type: 'delivery', total: 58.80, items: [{ name: 'X-Burger Clássico', quantity: 2, price: 28.90 }] },
  { id: 'order-2', branch_id: 'branch-1', customer_name: 'Lucia Santos', customer_address: 'Av. Paulista, 1000', created_at: new Date(Date.now() - 900000).toISOString(), status: 'preparing', payment_method: 'pix', delivery_type: 'delivery', total: 34.90, items: [{ name: 'X-Bacon Supreme', quantity: 1, price: 34.90 }] },
  { id: 'order-3', branch_id: 'branch-1', customer_name: 'Rafael Lima', customer_address: 'Rua Bela Cintra, 500', created_at: new Date(Date.now() - 1800000).toISOString(), status: 'ready', payment_method: 'debit_card', delivery_type: 'pickup', total: 28.90, items: [{ name: 'X-Burger Clássico', quantity: 1, price: 28.90 }] },
  { id: 'order-4', branch_id: 'branch-1', customer_name: 'Marina Costa', customer_address: 'Rua Haddock Lobo, 800', created_at: new Date(Date.now() - 3600000).toISOString(), status: 'delivered', payment_method: 'credit_card', delivery_type: 'delivery', total: 71.80, items: [{ name: 'X-Burger Clássico', quantity: 1, price: 28.90 }, { name: 'Batata Frita', quantity: 1, price: 12.90 }, { name: 'X-Bacon Supreme', quantity: 1, price: 34.90 }] },
  { id: 'order-5', branch_id: 'branch-1', customer_name: 'Tiago Oliveira', customer_address: 'Alameda Santos, 300', created_at: new Date(Date.now() - 7200000).toISOString(), status: 'cancelled', payment_method: 'pix', delivery_type: 'delivery', total: 28.90, items: [{ name: 'X-Burger Clássico', quantity: 1, price: 28.90 }] },
  { id: 'order-6', branch_id: 'branch-3', customer_name: 'Yuki Tanaka', customer_address: 'Rua São Joaquim, 150', created_at: new Date(Date.now() - 600000).toISOString(), status: 'pending', payment_method: 'credit_card', delivery_type: 'delivery', total: 54.90, items: [{ name: 'Sushi Combo 20 peças', quantity: 1, price: 54.90 }] },
]

export const mockCoupons: MerchantCouponDTO[] = [
  { id: 'coup-1', branch_id: 'branch-1', code: 'BURGER10', description: '10% off em pedidos acima de R$ 30', discount_type: 'percentage', discount_value: '10', min_order: '30', max_uses: 500, current_uses: 123, valid_until: new Date(Date.now() + 30 * 86400000).toISOString(), is_active: true, rules: {} },
  { id: 'coup-2', branch_id: 'branch-1', code: 'FRETEGRATIS', description: 'Frete grátis em pedidos acima de R$ 40', discount_type: 'fixed', discount_value: '5', min_order: '40', max_uses: 200, current_uses: 45, valid_until: new Date(Date.now() + 15 * 86400000).toISOString(), is_active: true, rules: {} },
  { id: 'coup-3', branch_id: 'branch-2', code: 'BURGER15', description: '15% off em pedidos acima de R$ 50', discount_type: 'percentage', discount_value: '15', min_order: '50', max_uses: 300, current_uses: 89, valid_until: new Date(Date.now() + 7 * 86400000).toISOString(), is_active: false, rules: {} },
]

export const mockCampaigns: CampaignDTO[] = [
  { id: 'camp-1', name: 'Semana do Hambúrguer', discount: '10%', status: 'active' },
  { id: 'camp-2', name: 'Happy Hour', discount: '15%', status: 'active' },
]
