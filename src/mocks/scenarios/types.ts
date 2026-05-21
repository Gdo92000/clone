export type ScenarioName =
  | 'default'
  | 'empty_store'
  | 'kitchen_congested'
  | 'payment_declined'
  | 'courier_offline'
  | 'tenant_expired'
  | 'merchant_blocked'

export interface ScenarioConfig {
  name: ScenarioName
  label: string
  description: string
}

export const scenarios: ScenarioConfig[] = [
  { name: 'default', label: 'Padrão', description: 'Fluxo normal com dados completos' },
  { name: 'empty_store', label: 'Loja sem pedidos', description: 'Nenhum pedido ativo, cardápio reduzido' },
  { name: 'kitchen_congested', label: 'Cozinha congestionada', description: 'Muitos pedidos pendentes, tempos elevados' },
  { name: 'payment_declined', label: 'Pagamento recusado', description: 'Simula falha no processamento de pagamento' },
  { name: 'courier_offline', label: 'Entregador offline', description: 'Nenhum entregador disponível na região' },
  { name: 'tenant_expired', label: 'Tenant expirado', description: 'Assinatura do tenant expirou' },
  { name: 'merchant_blocked', label: 'Merchant bloqueado', description: 'Merchant bloqueado por inadimplência' },
]
