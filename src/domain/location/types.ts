/**
 * User Location Domain Model
 *
 * Fonte da verdade para localização do usuário.
 * Não deve ser mockado — sempre vem de GPS real ou fallback IP.
 */

import type { Coordinates } from '../geospatial/geodesy';

export type LocationSource = 'gps' | 'manual' | 'ip';

export interface UserLocation {
  /**
   * Coordenadas precisas (GPS ou IP geolocation)
   * Estas são as coordenadas de referência para todos os cálculos
   */
  coordinates: Coordinates;

  /**
   * Informação de cidade/estado obtida via reverse geocoding
   * Pode ser null se geocoding falhar
   */
  city?: {
    name: string;
    state: string;
    stateCode?: string;
    country?: string;
    neighborhood?: string;
  };

  /**
   * Precisão da localização em metros (apenas para GPS)
   * undefined para IP (precisão ~20km)
   */
  accuracy?: number;

  /**
   * Fonte da localização
   * 'gps' = GPS/WiFi (alta precisão)
   * 'ip' = Geolocalização por IP (baixa precisão)
   * 'manual' = Usuário digitou endereço
   */
  source: LocationSource;

  /**
   * Timestamp da leitura em milissegundos
   */
  timestamp: number;
}

/**
 * Verifica se a localização é precisa o suficiente para filtros de proximidade
 * GPS: >= 100m são usáveis
 * IP: considerar imprecisa
 */
export function isLocationPrecise(location: UserLocation): boolean {
  if (location.source === 'gps') {
    return (location.accuracy ?? Infinity) <= 100;
  }
  return false; // IP não é preciso
}

/**
 * Verifica se duas localizações estão na mesma cidade
 * Usa normalização robusta para evitar falsos negativos
 */
export function isSameCity(
  a: UserLocation['city'],
  b: UserLocation['city']
): boolean {
  if (!a || !b) return false;
  if (a.name.toLowerCase() === b.name.toLowerCase() && a.state === b.state) {
    return true;
  }
  // TODO: implementar tabela de aliases
  return false;
}
