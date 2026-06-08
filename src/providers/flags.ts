/**
 * Provider Flags - Single source of truth: runtime config
 *
 * Atualmente os mocks por domínio estão desabilitados por padrão (false).
 * O backend é a fonte canônica em dev (ADR-004) e em prod.
 * Estes providers só seriam ativados se reintroduzirmos o gate de env var.
 */

export function isMockRestaurants(): boolean {
  return false
}

export function isMockOrders(): boolean {
  return false
}
