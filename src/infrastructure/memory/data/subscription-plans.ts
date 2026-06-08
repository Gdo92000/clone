import type { Plan, PlanAddon } from 'src/domain/entities/Plan';

export const mockPlans: Plan[] = [
  { id: 'basic', name: 'Básico', monthlyPrice: 29.90, description: 'Ideal para pequenos negócios', includedFeatures: [], limits: { branches: 1, products: 50, users: 2, campaigns: 2 } },
  { id: 'pro', name: 'Profissional', monthlyPrice: 79.90, description: 'Para negócios em crescimento', includedFeatures: [], limits: { branches: 3, products: 200, users: 10, campaigns: 10 } },
  { id: 'premium', name: 'Premium', monthlyPrice: 199.90, description: 'Solução completa para redes', includedFeatures: [], limits: { branches: 10, products: 999, users: 50, campaigns: 99 } },
];

export const mockAddons: PlanAddon[] = [
  { id: 'addon-1', name: 'Módulo de Fidelidade', monthlyPrice: 19.90, featureKey: 'loyalty_program', description: 'Programa de fidelidade com recompensas' },
  { id: 'addon-2', name: 'Integração iFood', monthlyPrice: 29.90, featureKey: 'ifood_integration', description: 'Integração direta com iFood' },
  { id: 'addon-3', name: 'Relatórios Avançados', monthlyPrice: 14.90, featureKey: 'advanced_reports', description: 'Relatórios detalhados de vendas e desempenho' },
  { id: 'addon-4', name: 'Múltiplos PDVs', monthlyPrice: 24.90, featureKey: 'multi_branch', description: 'Conecte vários pontos de venda' },
];
