import type { AuthUserDTO } from '../../dto/authDto'
import { mockUsers } from './auth'

export interface CoverageCity {
  id: string
  name: string
  state: string
  latitude: string
  longitude: string
  radius_km: number
  is_active: boolean
  restaurant_count: number
  created_at: string
}

export const mockCoverageCities: CoverageCity[] = [
  { id: 'city-sao-paulo', name: 'São Paulo', state: 'SP', latitude: '-23.5505', longitude: '-46.6333', radius_km: 30, is_active: true, restaurant_count: 8, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'city-rio-de-janeiro', name: 'Rio de Janeiro', state: 'RJ', latitude: '-22.9068', longitude: '-43.1729', radius_km: 25, is_active: true, restaurant_count: 0, created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 'city-belo-horizonte', name: 'Belo Horizonte', state: 'MG', latitude: '-19.9167', longitude: '-43.9345', radius_km: 20, is_active: true, restaurant_count: 0, created_at: new Date(Date.now() - 259200000).toISOString() },
]

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
}

export interface AuditEvent {
  id: string
  user_id: string
  action: string
  details: string
  ip: string
  created_at: string
}

export interface SupportTicket {
  id: string
  user_id: string
  subject: string
  status: string
  priority: string
  created_at: string
  assigned_to?: string
}

export interface FeatureFlag {
  id: string
  key: string
  name: string
  enabled: boolean
  description: string
}

export interface GlobalCoupon {
  id: string
  code: string
  description: string | null
  discount_type: string
  discount_value: string
  min_order: string | null
  max_uses: number
  current_uses: number
  valid_from: string
  valid_until: string
  is_active: boolean
  created_at: string
}

export interface Permission {
  id: string
  role: string
  resource: string
  action: string
  name: string
}

export interface Capability {
  id: string
  feature_key: string
  name: string
  description: string
  category: string
  charge_type: string
  required_plan: string
  monthly_price?: string
}

export interface CommissionPlan {
  plan_id: string
  marketplace_fee: string
  delivery_fee: string
  payment_fee: string
  additional_fees: { label: string; percentage: number }[]
}

export interface PlatformMetrics {
  totalOrders: number
  totalRevenue: string
  avgTicket: number
  activeStores: number
  deliveryPercent: number
  takeoutPercent: number
}

export interface LoyaltySettings {
  branch_id: string
  points_per_currency: number
  currency_per_point: number
  min_points_to_redeem: number
  enabled: boolean
}

export interface LoyaltyReward {
  id: string
  branch_id: string
  name: string
  points_required: number
  discount_type: string
  discount_value: number
  active: boolean
}

export interface UserNotification {
  id: string
  user_id: string
  title: string
  body: string
  type: string
  read: boolean
  created_at: string
}

export interface ConsumerOrder {
  id: string
  branch_id: string
  customer_name: string
  status: string
  total: number
  items: { name: string; quantity: number; price: number }[]
  created_at: string
}

export interface ConsumerLoyalty {
  user_id: string
  branch_id: string
  balance: number
  points_per_real: string
  rewards: Array<{
    id: string
    name: string
    points_required: number
    discount_type: string
    discount_value: number
  }>
}

export const mockGlobalCoupons: GlobalCoupon[] = [
  { id: 'gc-1', code: 'BEMVINDO10', description: '10% off em pedidos acima de R$ 20', discount_type: 'percentage', discount_value: '10', min_order: '20', max_uses: 1000, current_uses: 234, valid_from: new Date(Date.now() - 30 * 86400000).toISOString(), valid_until: new Date(Date.now() + 90 * 86400000).toISOString(), is_active: true, created_at: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: 'gc-2', code: 'FRETEGRATIS10', description: null, discount_type: 'fixed', discount_value: '10', min_order: '30', max_uses: 500, current_uses: 89, valid_from: new Date(Date.now() - 30 * 86400000).toISOString(), valid_until: new Date(Date.now() + 60 * 86400000).toISOString(), is_active: true, created_at: new Date(Date.now() - 30 * 86400000).toISOString() },
]

export const mockNotifications: Notification[] = [
  { id: 'notif-1', title: 'Novo pedido', message: 'Pedido #order-1 foi criado', type: 'order', read: false, created_at: new Date().toISOString() },
  { id: 'notif-2', title: 'Assinatura próxima do vencimento', message: 'Sua assinatura vence em 5 dias', type: 'billing', read: false, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'notif-3', title: 'Avaliação recebida', message: 'Cliente avaliou o pedido #order-4 com 5 estrelas', type: 'review', read: true, created_at: new Date(Date.now() - 172800000).toISOString() },
]

export const mockAuditEvents: AuditEvent[] = [
  { id: 'audit-1', user_id: 'user-1', action: 'LOGIN', details: 'Login realizado', ip: '192.168.1.100', created_at: new Date().toISOString() },
  { id: 'audit-2', user_id: 'user-2', action: 'ORDER_UPDATE', details: 'Status do pedido order-2 alterado para preparing', ip: '192.168.1.101', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'audit-3', user_id: 'user-1', action: 'USER_CREATE', details: 'Novo usuário criado: maria@sakura.com', ip: '192.168.1.100', created_at: new Date(Date.now() - 86400000).toISOString() },
]

export const mockSupportTickets: SupportTicket[] = [
  { id: 'ticket-1', user_id: 'user-2', subject: 'Erro no fechamento do pedido', status: 'open', priority: 'high', created_at: new Date().toISOString() },
  { id: 'ticket-2', user_id: 'user-3', subject: 'Dúvida sobre relatórios', status: 'in_progress', priority: 'medium', created_at: new Date(Date.now() - 86400000).toISOString(), assigned_to: 'user-1' },
  { id: 'ticket-3', user_id: 'user-4', subject: 'Problema no aplicativo', status: 'resolved', priority: 'low', created_at: new Date(Date.now() - 604800000).toISOString(), assigned_to: 'user-1' },
]

export const mockFeatureFlags: FeatureFlag[] = [
  { id: 'ff-1', key: 'new_checkout', name: 'Novo Checkout', enabled: true, description: 'Habilitar novo fluxo de checkout' },
  { id: 'ff-2', key: 'dark_mode', name: 'Modo Escuro', enabled: true, description: 'Habilitar tema escuro' },
  { id: 'ff-3', key: 'loyalty_program', name: 'Programa de Fidelidade', enabled: true, description: 'Habilitar programa de fidelidade' },
  { id: 'ff-4', key: 'ai_recommendations', name: 'Recomendações IA', enabled: false, description: 'Recomendações baseadas em IA' },
]

export const mockPermissions: Permission[] = [
  { id: 'perm-1', role: 'superadmin', resource: 'all', action: '*', name: 'Acesso total' },
  { id: 'perm-2', role: 'admin', resource: 'orders', action: 'crud', name: 'Gerenciar pedidos' },
  { id: 'perm-3', role: 'admin', resource: 'menu', action: 'crud', name: 'Gerenciar cardápio' },
  { id: 'perm-4', role: 'admin', resource: 'reports', action: 'read', name: 'Ver relatórios' },
  { id: 'perm-5', role: 'manager', resource: 'orders', action: 'read', name: 'Ver pedidos' },
  { id: 'perm-6', role: 'manager', resource: 'kitchen', action: 'update', name: 'Atualizar cozinha' },
  { id: 'perm-7', role: 'courier', resource: 'deliveries', action: 'update', name: 'Gerenciar entregas' },
]

export const mockCapabilities: Capability[] = [
  { id: 'cap-1', feature_key: 'multi_branch', name: 'Múltiplas filiais', description: 'Gerenciar múltiplas filiais', category: 'core', charge_type: 'included', required_plan: 'basic' },
  { id: 'cap-2', feature_key: 'advanced_reports', name: 'Relatórios avançados', description: 'Relatórios detalhados', category: 'analytics', charge_type: 'monthly_addon', required_plan: 'pro', monthly_price: '14.90' },
  { id: 'cap-3', feature_key: 'loyalty_program', name: 'Programa de fidelidade', description: 'Programa de fidelidade completo', category: 'premium', charge_type: 'monthly_addon', required_plan: 'basic', monthly_price: '19.90' },
  { id: 'cap-4', feature_key: 'ifood_integration', name: 'Integração iFood', description: 'Integração com iFood', category: 'integration', charge_type: 'monthly_addon', required_plan: 'basic', monthly_price: '29.90' },
]

export const mockCommissionPlans: CommissionPlan[] = [
  { plan_id: 'basic', marketplace_fee: '12', delivery_fee: '8', payment_fee: '3.5', additional_fees: [] },
  { plan_id: 'pro', marketplace_fee: '8', delivery_fee: '5', payment_fee: '2.5', additional_fees: [{ label: 'Marketing', percentage: 2 }] },
  { plan_id: 'premium', marketplace_fee: '5', delivery_fee: '3', payment_fee: '1.5', additional_fees: [{ label: 'Marketing', percentage: 1.5 }] },
]

export const mockPlatformMetrics: PlatformMetrics = {
  totalOrders: 1234,
  totalRevenue: '45678.90',
  avgTicket: 37.02,
  activeStores: 8,
  deliveryPercent: 65,
  takeoutPercent: 35,
}

export const mockAdminUsers: AuthUserDTO[] = mockUsers.filter(u => u.role !== 'customer')

export const mockLoyaltySettings: LoyaltySettings = {
  branch_id: 'branch-1',
  points_per_currency: 10,
  currency_per_point: 0.01,
  min_points_to_redeem: 100,
  enabled: true,
}

export const mockLoyaltyRewards: LoyaltyReward[] = [
  { id: 'reward-1', branch_id: 'branch-1', name: 'Desconto de R$ 5', points_required: 500, discount_type: 'fixed', discount_value: 5, active: true },
  { id: 'reward-2', branch_id: 'branch-1', name: 'Desconto de 10%', points_required: 1000, discount_type: 'percentage', discount_value: 10, active: true },
  { id: 'reward-3', branch_id: 'branch-1', name: 'Hambúrguer Grátis', points_required: 2000, discount_type: 'item', discount_value: 28.90, active: true },
]

export const mockUserNotifications: UserNotification[] = [
  { id: 'un-1', user_id: 'user-5', title: 'Pedido confirmado', body: 'Seu pedido #order-1 foi confirmado', type: 'order', read: false, created_at: new Date().toISOString() },
  { id: 'un-2', user_id: 'user-5', title: 'Pedido entregue', body: 'Seu pedido #order-4 foi entregue', type: 'order', read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'un-3', user_id: 'user-5', title: 'Ganhe pontos', body: 'Você ganhou 100 pontos de fidelidade', type: 'loyalty', read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
]

export const mockConsumerOrders: ConsumerOrder[] = [
  { id: 'order-1', branch_id: 'branch-1', customer_name: 'Ana Cliente', status: 'pending', total: 28.90, items: [{ name: 'X-Burger Clássico', quantity: 1, price: 28.90 }], created_at: new Date().toISOString() },
  { id: 'order-4', branch_id: 'branch-1', customer_name: 'Ana Cliente', status: 'delivered', total: 71.80, items: [{ name: 'X-Burger Clássico', quantity: 1, price: 28.90 }, { name: 'Batata Frita', quantity: 1, price: 12.90 }], created_at: new Date(Date.now() - 86400000).toISOString() },
]

export const mockConsumerLoyalty: ConsumerLoyalty = {
  user_id: 'user-5',
  branch_id: 'branch-1',
  balance: 750,
  points_per_real: '1',
  rewards: [
    { id: 'reward-1', name: 'Desconto de R$ 5', points_required: 500, discount_type: 'fixed', discount_value: 5 },
    { id: 'reward-2', name: 'Desconto de 10%', points_required: 1000, discount_type: 'percentage', discount_value: 10 },
  ],
}

export interface ConsumerReview {
  id: string
  target: string
  author: string
  rating: number
  body: string
}

export const mockConsumerTickets: SupportTicket[] = [
  { id: 'ticket-1', user_id: 'user-5', subject: 'Pedido atrasado', status: 'open', priority: 'high', created_at: new Date().toISOString() },
  { id: 'ticket-2', user_id: 'user-5', subject: 'Item faltando no pedido', status: 'resolved', priority: 'medium', created_at: new Date(Date.now() - 86400000).toISOString(), assigned_to: 'user-1' },
]

export const mockConsumerReviews: ConsumerReview[] = [
  { id: 'review-1', target: 'rest-1', author: 'Ana Cliente', rating: 5, body: 'Hamburguer excelente!' },
  { id: 'review-2', target: 'rest-2', author: 'Ana Cliente', rating: 4, body: 'Bom, mas demorou um pouco.' },
]
