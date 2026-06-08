export interface SubscriptionPlan {
  id: string
  name: string
  monthly_price: string
  description: string
  max_branches: number
  max_products: number
  max_users: number
  max_campaigns: number
  is_active: boolean
}

export interface Addon {
  id: string
  name: string
  monthly_price: string
  description: string
  category: string
  is_active: boolean
}

export interface Subscription {
  company_id: string
  plan_id: string
  addon_ids: string[]
  billing_status: 'trial' | 'active' | 'past_due' | 'blocked' | 'cancelled'
  trial_ends_at: string | null
  current_period_ends_at: string
  blocked_reason: string | null
}

export interface Invoice {
  id: string
  company_id: string
  amount: string
  status: 'open' | 'paid' | 'overdue' | 'cancelled' | 'refunded'
  due_date: string
  paid_at: string | null
}

export const mockPlans: SubscriptionPlan[] = [
  { id: 'basic', name: 'Básico', monthly_price: '29.90', description: 'Ideal para pequenos negócios', max_branches: 1, max_products: 50, max_users: 2, max_campaigns: 2, is_active: true },
  { id: 'pro', name: 'Profissional', monthly_price: '79.90', description: 'Para negócios em crescimento', max_branches: 3, max_products: 200, max_users: 10, max_campaigns: 10, is_active: true },
  { id: 'premium', name: 'Premium', monthly_price: '199.90', description: 'Solução completa para redes', max_branches: 10, max_products: 999, max_users: 50, max_campaigns: 99, is_active: true },
]

export const mockAddons: Addon[] = [
  { id: 'addon-1', name: 'Módulo de Fidelidade', monthly_price: '19.90', description: 'Programa de fidelidade com recompensas', category: 'engagement', is_active: true },
  { id: 'addon-2', name: 'Integração iFood', monthly_price: '29.90', description: 'Integração direta com iFood', category: 'integration', is_active: true },
  { id: 'addon-3', name: 'Relatórios Avançados', monthly_price: '14.90', description: 'Relatórios detalhados de vendas e desempenho', category: 'analytics', is_active: true },
  { id: 'addon-4', name: 'Múltiplos PDVs', monthly_price: '24.90', description: 'Conecte vários pontos de venda', category: 'operations', is_active: false },
]

export const mockSubscriptions: Subscription[] = [
  { company_id: 'comp-1', plan_id: 'pro', addon_ids: ['addon-1', 'addon-3'], billing_status: 'active', trial_ends_at: null, current_period_ends_at: new Date(Date.now() + 25 * 86400000).toISOString(), blocked_reason: null },
  { company_id: 'comp-2', plan_id: 'premium', addon_ids: ['addon-2'], billing_status: 'active', trial_ends_at: null, current_period_ends_at: new Date(Date.now() + 20 * 86400000).toISOString(), blocked_reason: null },
  { company_id: 'comp-3', plan_id: 'basic', addon_ids: [], billing_status: 'trial', trial_ends_at: new Date(Date.now() + 10 * 86400000).toISOString(), current_period_ends_at: new Date(Date.now() + 10 * 86400000).toISOString(), blocked_reason: null },
  { company_id: 'comp-4', plan_id: 'basic', addon_ids: [], billing_status: 'trial', trial_ends_at: new Date(Date.now() + 10 * 86400000).toISOString(), current_period_ends_at: new Date(Date.now() + 10 * 86400000).toISOString(), blocked_reason: null },
]

export const mockInvoices: Invoice[] = [
  { id: 'inv-1', company_id: 'comp-1', amount: '79.90', status: 'paid', due_date: new Date(Date.now() - 5 * 86400000).toISOString(), paid_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'inv-2', company_id: 'comp-1', amount: '79.90', status: 'paid', due_date: new Date(Date.now() + 25 * 86400000).toISOString(), paid_at: null },
  { id: 'inv-3', company_id: 'comp-2', amount: '199.90', status: 'paid', due_date: new Date(Date.now() - 10 * 86400000).toISOString(), paid_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'inv-4', company_id: 'comp-2', amount: '199.90', status: 'open', due_date: new Date(Date.now() + 20 * 86400000).toISOString(), paid_at: null },
  { id: 'inv-5', company_id: 'comp-3', amount: '29.90', status: 'open', due_date: new Date(Date.now() + 10 * 86400000).toISOString(), paid_at: null },
]
