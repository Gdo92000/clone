/**
 * Coverage Area Domain Model
 *
 * Representa uma área de entrega geográfica
 * Separada de CityCoverage (que é contrato administrativo)
 */

import { calculateDistance, type Coordinates } from './geodesy';

/**
 * Área de cobertura baseada em coordenadas
 */
export interface CoverageArea {
  /**
   * Centro da área (pode ser a cidade, ou o restaurante)
   */
  center: Coordinates;

  /**
   * Raio de entrega em quilômetros
   */
  radiusKm: number;

  /**
   * Identificador da área (ex: city-id)
   */
  id?: string;
}

/**
 * Verifica se um ponto está dentro da área de cobertura
 */
export function isWithinCoverage(
  point: Coordinates,
  coverage: CoverageArea
): boolean {
  const distance = calculateDistance(
    point.latitude,
    point.longitude,
    coverage.center.latitude,
    coverage.center.longitude
  );
  return distance <= coverage.radiusKm;
}

/**
 * Calcula a distância de um ponto até o centro da área
 */
export function distanceToCoverageCenter(
  point: Coordinates,
  coverage: CoverageArea
): number {
  return calculateDistance(
    point.latitude,
    point.longitude,
    coverage.center.latitude,
    coverage.center.longitude
  );
}
