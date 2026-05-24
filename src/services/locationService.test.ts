import { describe, it, expect } from 'vitest';
import { calculateDistance, formatDistance } from './locationService';

describe('calculateDistance (Haversine)', () => {
  it('returns 0 for same coordinates', () => {
    const d = calculateDistance(-23.5505, -46.6333, -23.5505, -46.6333);
    expect(d).toBe(0);
  });

  it('calculates known distance São Paulo → Rio de Janeiro (~360km)', () => {
    const d = calculateDistance(-23.5505, -46.6333, -22.9068, -43.1729);
    expect(d).toBeGreaterThan(350);
    expect(d).toBeLessThan(370);
  });

  it('calculates known distance São Paulo → Belo Horizonte (~490km)', () => {
    const d = calculateDistance(-23.5505, -46.6333, -19.9167, -43.9345);
    expect(d).toBeGreaterThan(480);
    expect(d).toBeLessThan(510);
  });

  it('calculates small distance (~1km)', () => {
    const d = calculateDistance(-23.5505, -46.6333, -23.5585, -46.6420);
    expect(d).toBeGreaterThan(0.5);
    expect(d).toBeLessThan(2);
  });

  it('handles negative and positive coordinates', () => {
    const d = calculateDistance(51.5074, -0.1278, 48.8566, 2.3522);
    expect(d).toBeGreaterThan(300);
    expect(d).toBeLessThan(400);
  });
});

describe('formatDistance', () => {
  it('formats values >= 1km with one decimal', () => {
    expect(formatDistance(5)).toBe('5.0km');
    expect(formatDistance(12.34)).toBe('12.3km');
    expect(formatDistance(1)).toBe('1.0km');
  });

  it('formats values < 1km in meters', () => {
    expect(formatDistance(0.5)).toBe('500m');
    expect(formatDistance(0)).toBe('0m');
    expect(formatDistance(0.999)).toBe('999m');
  });

  it('rounds meters to nearest integer', () => {
    expect(formatDistance(0.123)).toBe('123m');
    expect(formatDistance(0.789)).toBe('789m');
  });
});
