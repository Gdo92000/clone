import type { FeatureFlag, Capability } from 'src/domain/entities/FeatureFlag';

export const mockFeatureFlags: FeatureFlag[] = [
  { id: 'ff-1', key: 'new_checkout', name: 'Novo Checkout', description: 'Habilitar novo fluxo de checkout', enabled: true, category: 'checkout', createdAt: '', updatedAt: '' },
  { id: 'ff-2', key: 'dark_mode', name: 'Modo Escuro', description: 'Habilitar tema escuro', enabled: true, category: 'ui', createdAt: '', updatedAt: '' },
  { id: 'ff-3', key: 'loyalty_program', name: 'Programa de Fidelidade', description: 'Habilitar programa de fidelidade', enabled: true, category: 'engagement', createdAt: '', updatedAt: '' },
  { id: 'ff-4', key: 'ai_recommendations', name: 'Recomendações IA', description: 'Recomendações baseadas em IA', enabled: false, category: 'ai', createdAt: '', updatedAt: '' },
];

export const mockCapabilities: Capability[] = [
  { featureKey: 'multi_branch', name: 'Múltiplas filiais', description: 'Gerenciar múltiplas filiais', monthlyPrice: 0, dependencies: [], category: 'core', requiredPlan: 'basic', chargeType: 'monthly', relatedLimits: [] },
  { featureKey: 'advanced_reports', name: 'Relatórios avançados', description: 'Relatórios detalhados', monthlyPrice: 14.90, dependencies: [], category: 'analytics', requiredPlan: 'pro', chargeType: 'monthly', relatedLimits: [] },
  { featureKey: 'loyalty_program', name: 'Programa de fidelidade', description: 'Programa de fidelidade completo', monthlyPrice: 19.90, dependencies: [], category: 'premium', requiredPlan: 'basic', chargeType: 'monthly', relatedLimits: [] },
  { featureKey: 'ifood_integration', name: 'Integração iFood', description: 'Integração com iFood', monthlyPrice: 29.90, dependencies: [], category: 'integration', requiredPlan: 'basic', chargeType: 'monthly', relatedLimits: [] },
];
