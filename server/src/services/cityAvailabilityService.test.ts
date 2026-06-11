import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { setProvider } from '../db/provider-selector';
import { CAPABILITIES } from '../db/provider';
import type { EnvConfig } from '../config';
import { createDatabase } from '../db';
import * as cityAvailability from '../services/cityAvailabilityService';

const memoryEnv: EnvConfig = {
  NODE_ENV: 'test',
  DATABASE_PROVIDER: 'memory',
  DATABASE_URL: 'memory',
  JWT_SECRET: 'test',
  CORS_ORIGINS: '*',
  AUTH_PROVIDER: 'local',
  REDIS_URL: '',
  PORT: 0,
  LOG_LEVEL: 'silent',
  MAX_BODY_SIZE: 1024,
  LOGIN_MAX_ATTEMPTS: 5,
  LOGIN_LOCKOUT_MINUTES: 15,
  VAPID_PUBLIC_KEY: 'BF6kYMoL-rjFycPGZRdABQzz2e0vQbLFp0SorteBkwtFaYjqkEz4iQv4L88QLm4fi83F2Ze07PMtGASS4xiYWH8',
  VAPID_PRIVATE_KEY: 'UVr3DVIu_avx7vHJTB00941YQEprBpaMm6IZMscUDPg',
  VAPID_SUBJECT: 'mailto:dev@fluxdelivery.com',
};

beforeAll(() => {
  createDatabase(memoryEnv);
  setProvider('memory', CAPABILITIES.memory);
});

afterAll(() => {
  setProvider('memory', CAPABILITIES.memory);
});

const neighborhoodQuery = z.object({
  city: z.string().min(1).max(100),
  state: z.string().length(2),
});

const cityCheckQuery = z.object({
  city: z.string().min(1).max(100),
  state: z.string().length(2),
});

const app = new Hono();
app.get('/cities/active', async (c) => c.json(await cityAvailability.listActiveCities()));
app.get('/neighborhoods/active', zValidator('query', neighborhoodQuery), async (c) => {
  const { city, state } = c.req.valid('query');
  return c.json(await cityAvailability.listActiveNeighborhoods(city, state));
});
app.get('/cities/has-coverage', zValidator('query', cityCheckQuery), async (c) => {
  const { city, state } = c.req.valid('query');
  return c.json({ city, state, covered: await cityAvailability.hasActiveRestaurantsInCity(city, state) });
});

void createDatabase;

describe('cityAvailabilityService', () => {
  describe('listActiveCities', () => {
    it('deve retornar array', async () => {
      const cities = await cityAvailability.listActiveCities();
      expect(Array.isArray(cities)).toBe(true);
    });

    it('cada cidade deve ter shape válido (city, state, restaurant_count)', async () => {
      const cities = await cityAvailability.listActiveCities();
      for (const c of cities) {
        expect(c).toHaveProperty('city');
        expect(c).toHaveProperty('state');
        expect(c).toHaveProperty('restaurant_count');
        expect(typeof c.restaurant_count).toBe('number');
      }
    });
  });

  describe('listActiveNeighborhoods', () => {
    it('deve retornar array vazio para cidade inexistente', async () => {
      const result = await cityAvailability.listActiveNeighborhoods('CidadeInexistente', 'XX');
      expect(result).toEqual([]);
    });
  });

  describe('hasActiveRestaurantsInCity', () => {
    it('deve retornar false para cidade inexistente', async () => {
      const result = await cityAvailability.hasActiveRestaurantsInCity('CidadeInexistente', 'XX');
      expect(result).toBe(false);
    });
  });

  describe('hasActiveRestaurantsInNeighborhood', () => {
    it('deve retornar false para bairro inexistente', async () => {
      const result = await cityAvailability.hasActiveRestaurantsInNeighborhood(
        'CidadeInexistente',
        'XX',
        'BairroInexistente',
      );
      expect(result).toBe(false);
    });
  });
});

describe('city-coverage routes (via Hono app de teste)', () => {
  it('GET /cities/active deve retornar 200 e array', async () => {
    const res = await app.request('/cities/active');
    expect(res.status).toBe(200);
    const body: unknown = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  it('GET /neighborhoods/active deve retornar 400 sem state', async () => {
    const res = await app.request('/neighborhoods/active?city=Franca');
    expect(res.status).toBe(400);
  });

  it('GET /cities/has-coverage deve retornar 400 para state com tamanho inválido', async () => {
    const res = await app.request('/cities/has-coverage?city=Franca&state=SPX');
    expect(res.status).toBe(400);
  });
});
