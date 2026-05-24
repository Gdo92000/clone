import { describe, it, expect, vi, beforeEach } from 'vitest';
import { normalizeCityName, isSameCityName } from './cityCoverageService';

vi.mock('../api/coverageCityApi', () => ({
  coverageCityApi: { list: vi.fn() },
}));

vi.mock('../lib/logger', () => ({
  logger: { warn: vi.fn() },
}));

import { coverageCityApi } from '../api/coverageCityApi';
import { getRegisteredCityCoverages, findRegisteredCityCoverage } from './cityCoverageService';

describe('normalizeCityName', () => {
  it('lowercases the name', () => {
    expect(normalizeCityName('São Paulo')).toBe('sao paulo');
  });

  it('removes accents', () => {
    expect(normalizeCityName('São João del-Rei')).toBe('sao joao del-rei');
  });

  it('trims whitespace', () => {
    expect(normalizeCityName('  Belo Horizonte  ')).toBe('belo horizonte');
  });

  it('handles already normalized strings', () => {
    expect(normalizeCityName('franca')).toBe('franca');
  });
});

describe('isSameCityName', () => {
  it('returns true for identical names', () => {
    expect(isSameCityName('São Paulo', 'São Paulo')).toBe(true);
  });

  it('returns true for same city with different accents', () => {
    expect(isSameCityName('São Paulo', 'Sao Paulo')).toBe(true);
  });

  it('returns true for same city with different casing', () => {
    expect(isSameCityName('rio de janeiro', 'Rio de Janeiro')).toBe(true);
  });

  it('returns false for different cities', () => {
    expect(isSameCityName('São Paulo', 'Rio de Janeiro')).toBe(false);
  });
});

describe('getRegisteredCityCoverages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns coverages from API when available', async () => {
    vi.mocked(coverageCityApi.list).mockResolvedValue([
      { id: 'c1', name: 'Franca', state: 'SP', latitude: '-20.5355', longitude: '-47.4011', radius_km: 18, restaurant_count: 0, is_active: true, created_at: new Date().toISOString() },
    ]);

    const result = await getRegisteredCityCoverages();

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('c1');
    expect(result[0]?.lat).toBe(-20.5355);
    expect(result[0]?.lng).toBe(-47.4011);
    expect(result[0]?.radiusKm).toBe(18);
  });


});

describe('findRegisteredCityCoverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns matching coverage by city name', async () => {
    vi.mocked(coverageCityApi.list).mockResolvedValue([
      { id: 'city-franca', name: 'Franca', state: 'SP', latitude: '-20.5355', longitude: '-47.4011', radius_km: 18, restaurant_count: 0, is_active: true, created_at: new Date().toISOString() },
    ]);

    const result = await findRegisteredCityCoverage('Franca');

    expect(result).not.toBeNull();
    expect(result!.name).toBe('Franca');
  });

  it('matches regardless of accent/case', async () => {
    vi.mocked(coverageCityApi.list).mockResolvedValue([
      { id: 'city-sao-paulo', name: 'São Paulo', state: 'SP', latitude: '-23.5505', longitude: '-46.6333', radius_km: 30, restaurant_count: 8, is_active: true, created_at: new Date().toISOString() },
    ]);

    const result = await findRegisteredCityCoverage('Sao Paulo');

    expect(result).not.toBeNull();
    expect(result!.name).toBe('São Paulo');
  });

  it('returns null when city not found', async () => {
    vi.mocked(coverageCityApi.list).mockResolvedValue([
      { id: 'city-franca', name: 'Franca', state: 'SP', latitude: '-20.5355', longitude: '-47.4011', radius_km: 18, restaurant_count: 0, is_active: true, created_at: new Date().toISOString() },
    ]);

    const result = await findRegisteredCityCoverage('Tóquio');

    expect(result).toBeNull();
  });

  it('returns null on API error', async () => {
    vi.mocked(coverageCityApi.list).mockRejectedValue(new Error('API timeout'));

    const result = await findRegisteredCityCoverage('Franca');

    expect(result).toBeNull();
  });
});
