import type { SaasCapability } from './types';

export const capabilityCatalog: SaasCapability[] = [
  { featureKey: 'own_delivery', name: 'Delivery proprio', description: 'Gestao operacional de entregas internas.', monthlyPrice: 0, dependencies: [], category: 'core', requiredPlan: 'basic', chargeType: 'included', relatedLimits: [] },
  { featureKey: 'multi_users', name: 'Multiplos usuarios', description: 'Equipe com usuarios, papeis e vinculo por filial.', monthlyPrice: 29, dependencies: [], category: 'operations', requiredPlan: 'basic', chargeType: 'monthly_addon', relatedLimits: ['users'] },
  { featureKey: 'campaigns', name: 'Campanhas', description: 'Campanhas comerciais, cupons e promocoes.', monthlyPrice: 39, dependencies: [], category: 'premium', requiredPlan: 'basic', chargeType: 'monthly_addon', relatedLimits: ['campaigns', 'coupons'] },
  { featureKey: 'analytics', name: 'Analytics Pro', description: 'Indicadores de pedido, ticket medio e performance.', monthlyPrice: 49, dependencies: [], category: 'analytics', requiredPlan: 'basic', chargeType: 'monthly_addon', relatedLimits: ['reports'] },
  { featureKey: 'financial_suite', name: 'Financeiro completo', description: 'Fluxo de caixa, repasses, taxas, conciliacao e fechamento mensal.', monthlyPrice: 79, dependencies: ['analytics'], category: 'financial', requiredPlan: 'basic', chargeType: 'monthly_addon', relatedLimits: ['reports'] },
  { featureKey: 'advanced_reports', name: 'Relatorios avancados', description: 'Relatorios exportaveis e comparativos gerenciais.', monthlyPrice: 59, dependencies: ['analytics'], category: 'analytics', requiredPlan: 'pro', chargeType: 'monthly_addon', relatedLimits: ['reports'] },
  { featureKey: 'crm', name: 'CRM de clientes', description: 'Segmentacao, recorrencia e campanhas por comportamento.', monthlyPrice: 69, dependencies: ['campaigns'], category: 'premium', requiredPlan: 'pro', chargeType: 'monthly_addon', relatedLimits: ['campaigns'] },
  { featureKey: 'whatsapp_integration', name: 'Automacao WhatsApp', description: 'Notificacoes e relacionamento via WhatsApp.', monthlyPrice: 59, dependencies: ['crm'], category: 'integration', requiredPlan: 'basic', chargeType: 'monthly_addon', relatedLimits: [] },
  { featureKey: 'ai_product_descriptions', name: 'IA para descricoes', description: 'Geracao assistida de nomes e descricoes de produtos.', monthlyPrice: 29, dependencies: [], category: 'automation', requiredPlan: 'basic', chargeType: 'monthly_addon', relatedLimits: ['products'] },
  { featureKey: 'api_access', name: 'API access', description: 'Acesso futuro a API para integracoes externas.', monthlyPrice: 149, dependencies: ['analytics'], category: 'enterprise', requiredPlan: 'premium', chargeType: 'enterprise_contract', relatedLimits: [] },
  { featureKey: 'white_label', name: 'White label', description: 'Personalizacao de marca para redes maiores.', monthlyPrice: 299, dependencies: ['api_access'], category: 'enterprise', requiredPlan: 'premium', chargeType: 'enterprise_contract', relatedLimits: ['branches'] },
  { featureKey: 'kitchen_display', name: 'Tela de cozinha', description: 'Fluxo operacional para preparo e expedicao.', monthlyPrice: 35, dependencies: ['multi_users'], category: 'operations', requiredPlan: 'basic', chargeType: 'monthly_addon', relatedLimits: ['users'] },
{ featureKey: 'kitchen_auto_print', name: 'Impressão Automática na Cozinha', description: 'Impressão automática de pedidos aceitos via ESC/POS. Requer configuração de impressora por filial.', monthlyPrice: 49, dependencies: ['multi_users'], category: 'automation', requiredPlan: 'basic', chargeType: 'monthly_addon', relatedLimits: ['branches'] },
];

export function capabilityToAddonId(featureKey: string) {
  return `addon-${featureKey.replaceAll('_', '-')}`;
}
