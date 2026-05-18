import type { BillingInvoice, CompanySubscription, FeatureFlagOverride, SaasAddon, SaasPlan } from './types';

export const featureLabels = {
  advanced_reports: 'Relatorios avancados',
  campaigns: 'Campanhas e promocoes',
  ai_product_descriptions: 'IA para descricao de produtos',
  multi_users: 'Multiplos usuarios',
  whatsapp_integration: 'Integracao WhatsApp',
  analytics: 'Analytics Pro',
  loyalty_program: 'Programa de fidelidade',
  own_delivery: 'Delivery proprio',
  coupon_automation: 'Automacao de cupons',
  priority_support: 'Suporte prioritario',
  featured_home: 'Destaque na home',
  financial_suite: 'Financeiro completo',
  crm: 'CRM de clientes',
  api_access: 'API access',
  white_label: 'White label',
  team_management: 'Gestao de equipe',
  kitchen_display: 'Tela de cozinha',
  internal_courier: 'Entregador interno',
} as const;

export const saasPlans: SaasPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    monthlyPrice: 89,
    description: 'Entrada para restaurantes pequenos.',
    includedFeatures: ['own_delivery'],
    limits: { branches: 1, products: 40, users: 2, campaigns: 0 },
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 189,
    description: 'Operacao com mais recursos e crescimento.',
    includedFeatures: ['own_delivery', 'campaigns', 'multi_users', 'analytics'],
    limits: { branches: 3, products: 150, users: 8, campaigns: 5 },
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 349,
    description: 'Rede multi-filial com automacoes e destaque.',
    includedFeatures: [
      'own_delivery',
      'campaigns',
      'multi_users',
      'analytics',
      'advanced_reports',
      'financial_suite',
      'coupon_automation',
      'priority_support',
      'featured_home',
    ],
    limits: { branches: 12, products: 600, users: 40, campaigns: 30 },
  },
];

export const saasAddons: SaasAddon[] = [
  {
    id: 'addon-analytics-pro',
    name: 'Analytics Pro',
    monthlyPrice: 49,
    featureKey: 'analytics',
    description: 'Indicadores avancados sem trocar de plano.',
  },
  {
    id: 'addon-campaigns',
    name: 'Campanhas',
    monthlyPrice: 39,
    featureKey: 'campaigns',
    description: 'Promocoes, banners e ofertas programadas.',
  },
  {
    id: 'addon-multi-users',
    name: 'Multiplos usuarios',
    monthlyPrice: 29,
    featureKey: 'multi_users',
    description: 'Equipe com papeis, permissoes e vinculo por filial.',
  },
  {
    id: 'addon-ai-descriptions',
    name: 'IA para produtos',
    monthlyPrice: 29,
    featureKey: 'ai_product_descriptions',
    description: 'Geracao assistida de descricoes do cardapio.',
  },
  {
    id: 'addon-whatsapp',
    name: 'WhatsApp',
    monthlyPrice: 59,
    featureKey: 'whatsapp_integration',
    description: 'Avisos e atendimento integrados ao WhatsApp.',
  },
  {
    id: 'addon-loyalty',
    name: 'Fidelidade',
    monthlyPrice: 45,
    featureKey: 'loyalty_program',
    description: 'Pontos e beneficios para recompra.',
  },
  {
    id: 'addon-coupon-automation',
    name: 'Automacao de cupons',
    monthlyPrice: 35,
    featureKey: 'coupon_automation',
    description: 'Cupons automáticos por comportamento.',
  },
  {
    id: 'addon-financial-suite',
    name: 'Financeiro completo',
    monthlyPrice: 79,
    featureKey: 'financial_suite',
    description: 'Fluxo de caixa, repasses, taxas e conciliacao.',
  },
  {
    id: 'addon-crm',
    name: 'CRM de clientes',
    monthlyPrice: 69,
    featureKey: 'crm',
    description: 'Segmentacao e relacionamento recorrente.',
  },
  {
    id: 'addon-api-access',
    name: 'API access',
    monthlyPrice: 149,
    featureKey: 'api_access',
    description: 'Acesso a API para integracoes externas futuras.',
  },
];

export const companySubscriptions: CompanySubscription[] = [
  {
    companyId: 'company-1',
    planId: 'basic',
    addonIds: ['addon-analytics-pro', 'addon-campaigns', 'addon-financial-suite', 'addon-multi-users'],
    billingStatus: 'active',
    trialEndsAt: '2026-05-25',
    currentPeriodEndsAt: '2026-06-10',
  },
  {
    companyId: 'company-2',
    planId: 'pro',
    addonIds: ['addon-ai-descriptions', 'addon-whatsapp'],
    billingStatus: 'trial',
    trialEndsAt: '2026-05-18',
    currentPeriodEndsAt: '2026-06-18',
  },
];

export const featureFlagOverrides: FeatureFlagOverride[] = [
  {
    id: 'flag-1',
    companyId: 'company-1',
    featureKey: 'advanced_reports',
    enabled: false,
    reason: 'Disponivel somente via upgrade ou addon futuro.',
  },
  {
    id: 'flag-2',
    companyId: 'company-2',
    branchId: 'branch-3',
    featureKey: 'featured_home',
    enabled: true,
    reason: 'Campanha comercial de trial.',
  },
];

export const billingInvoices: BillingInvoice[] = [
  { id: 'INV-1001', companyId: 'company-1', amount: 177, status: 'paid', dueDate: '2026-05-10' },
  { id: 'INV-1002', companyId: 'company-2', amount: 0, status: 'open', dueDate: '2026-05-18' },
];
