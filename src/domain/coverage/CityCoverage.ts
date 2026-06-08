/**
 * City Coverage Domain Model
 *
 * Representa o contrato administrativo de uma cidade com a plataforma:
 * - A cidade está ativa na plataforma
 * - Tem um raio de entrega definido
 * - Não necessariamente todos os restaurantes da cidade estão precisamente mapeados
 */

export interface CityCoverage {
  /**
   * ID único
   */
  id: string;

  /**
   * Nome da cidade
   */
  name: string;

  /**
   * Estado
   */
  state: string;

  /**
   * Código do estado (2 letras)
   */
  stateCode: string;

  /**
   * Coordenadas do centro da cidade (para cálculo de distância)
   */
  center: {
    latitude: number;
    longitude: number;
  };

  /**
   * Raio de entrega padrão da cidade em km
   */
  radiusKm: number;

  /**
   * Contagem de restaurantes ativos
   */
  restaurantCount: number;

  /**
   * Se a cobertura está ativa
   */
  isActive: boolean;
}

/**
 * Normalização de nomes de cidade (usada para matching)
 */
export function normalizeCityName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Duas cidades são iguais se seus nomes normalizados e estados coincidem
 */
export function areCitiesEqual(
  a: { name: string; state?: string },
  b: { name: string; state?: string }
): boolean {
  if (!a.name || !b.name) return false;
  const nameMatch = normalizeCityName(a.name) === normalizeCityName(b.name);
  if (!nameMatch) return false;
  if (a.state && b.state) {
    return a.state.toUpperCase() === b.state.toUpperCase();
  }
  // If either state missing, names match is enough (or you can require both states present)
  return true;
}
