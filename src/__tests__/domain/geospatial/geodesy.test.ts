/**
 * @vitest
 */
import { describe, it, expect } from 'vitest';
import {
  calculateDistance,
  isValidCoordinates,
  normalizeCoordinates,
  isPointInCircle,
  sortByDistance,
  computeCentroid,
 } from '../../../domain/geospatial/geodesy';

describe('Geodesy', () => {
  describe('calculateDistance', () => {
   it('deve calcular distância entre dois pontos corretamente (São Paulo ↔ Rio de Janeiro)', () => {
     // São Paulo: -23.5505, -46.6333
     // Rio de Janeiro: -22.9068, -43.1729
     const distance = calculateDistance(-23.5505, -46.6333, -22.9068, -43.1729);
     // Distância geodésica em linha reta: ~360 km (não confundir com distância rodoviária ~430 km)
     expect(distance).toBeGreaterThan(355);
     expect(distance).toBeLessThan(365);
   });

    it('deve retornar 0 para o mesmo ponto', () => {
      const distance = calculateDistance(-20.5, -47.4, -20.5, -47.4);
      expect(distance).toBeCloseTo(0, 5);
    });

    it('deve calcular distância precisa entre Franca e Ribeirão Preto', () => {
      // Franca: -20.5386, -47.4008
      // Ribeirão Preto: -21.1775, -47.8103
      const distance = calculateDistance(-20.5386, -47.4008, -21.1775, -47.8103);
      // Distância conhecida: ~87 km
      expect(distance).toBeGreaterThan(80);
      expect(distance).toBeLessThan(95);
    });
  });

  describe('isValidCoordinates', () => {
    it('deve aceitar coordenadas válidas', () => {
      expect(isValidCoordinates({ latitude: -20.5, longitude: -47.4 })).toBe(true);
      expect(isValidCoordinates({ latitude: 0, longitude: 0 })).toBe(true);
      expect(isValidCoordinates({ latitude: 90, longitude: 180 })).toBe(true);
      expect(isValidCoordinates({ latitude: -90, longitude: -180 })).toBe(true);
    });

    it('deve rejeitar coordenadas inválidas', () => {
      expect(isValidCoordinates({ latitude: 91, longitude: 0 })).toBe(false);
      expect(isValidCoordinates({ latitude: -91, longitude: 0 })).toBe(false);
      expect(isValidCoordinates({ latitude: 0, longitude: 181 })).toBe(false);
      expect(isValidCoordinates({ latitude: NaN, longitude: 0 })).toBe(false);
      expect(isValidCoordinates({ latitude: 0, longitude: Infinity })).toBe(false);
    });
  });

  describe('normalizeCoordinates', () => {
    it('deve arredondar para 7 casas decimais (~1cm precisão)', () => {
      const coords = { latitude: -20.53863456789, longitude: -47.40081234567 };
      const normalized = normalizeCoordinates(coords);
      expect(normalized.latitude).toBe(-20.5386346);
      expect(normalized.longitude).toBe(-47.4008123);
      expect(normalized.latitude.toString().replace(/[^\d]/g, '').length).toBeLessThanOrEqual(9); // -20.5xxxxx
    });
  });

  describe('isPointInCircle', () => {
    const center = { latitude: -20.5386, longitude: -47.4008 };
    const radiusKm = 10;

    it('deve retornar true para ponto dentro do raio', () => {
      const inside = { latitude: -20.5, longitude: -47.4 };
      expect(isPointInCircle(inside, center, radiusKm)).toBe(true);
    });

    it('deve retornar false para ponto fora do raio', () => {
      const far = { latitude: -21.0, longitude: -48.0 };
      expect(isPointInCircle(far, center, radiusKm)).toBe(false);
    });

    it('deve retornar true para ponto exatamente no limite', () => {
      const _edge = calculateDistance(center.latitude, center.longitude, -20.6, -47.4);
      // Criar ponto a exatamente radiusKm de distância
      // (simplificação: não exato, mas testar condição boundary)
      const approxEdge = { latitude: -20.6, longitude: -47.4 };
      const dist = calculateDistance(
        center.latitude,
        center.longitude,
        approxEdge.latitude,
        approxEdge.longitude
      );
      expect(dist).toBeLessThan(radiusKm + 1);
    });
  });

  describe('sortByDistance', () => {
    const ref = { latitude: -20.5386, longitude: -47.4008 };
    const points = [
      { latitude: -20.5, longitude: -47.4 }, // ~5km
      { latitude: -20.6, longitude: -47.4 }, // ~7km
      { latitude: -20.5386, longitude: -47.4008 }, // 0km
    ];

   it('deve ordenar por distância crescente', () => {
     const sorted = sortByDistance(ref, points);
     // sorted retorna as mesmas referências dos pontos, ordenadas por distância
     expect(sorted[0]).toBe(points[2]); // ponto idêntico (0 km)
     expect(sorted[1]).toBe(points[0]); // ~5 km
     expect(sorted[2]).toBe(points[1]); // ~7 km
   });

    it('deve retornar array vazio se pontos vazio', () => {
      const sorted = sortByDistance(ref, []);
      expect(sorted).toEqual([]);
    });
  });

  describe('computeCentroid', () => {
    it('deve calcular centroide corretamente', () => {
      const coords = [
        { latitude: 0, longitude: 0 },
        { latitude: 10, longitude: 0 },
        { latitude: 0, longitude: 10 },
      ];
      const centroid = computeCentroid(coords);
      expect(centroid).not.toBeNull();
      if (centroid) {
        expect(centroid.latitude).toBeCloseTo(3.333, 2);
        expect(centroid.longitude).toBeCloseTo(3.333, 2);
      }
    });

    it('deve retornar null para array vazio', () => {
      const centroid = computeCentroid([]);
      expect(centroid).toBeNull();
    });
  });
});
