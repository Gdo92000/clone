import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import * as cityAvailability from '../services/cityAvailabilityService';

const route = new Hono();

route.get('/cities/active', async (c) => {
  const cities = await cityAvailability.listActiveCities();
  return c.json(cities);
});

const neighborhoodQuery = z.object({
  city: z.string().min(1).max(100),
  state: z.string().length(2),
});

route.get('/neighborhoods/active', zValidator('query', neighborhoodQuery), async (c) => {
  const { city, state } = c.req.valid('query');
  const neighborhoods = await cityAvailability.listActiveNeighborhoods(city, state);
  return c.json(neighborhoods);
});

const cityCheckQuery = z.object({
  city: z.string().min(1).max(100),
  state: z.string().length(2),
});

route.get('/cities/has-coverage', zValidator('query', cityCheckQuery), async (c) => {
  const { city, state } = c.req.valid('query');
  const covered = await cityAvailability.hasActiveRestaurantsInCity(city, state);
  return c.json({ city, state, covered });
});

const neighborhoodCheckQuery = z.object({
  city: z.string().min(1).max(100),
  state: z.string().length(2),
  neighborhood: z.string().min(1).max(100),
});

route.get('/neighborhoods/has-coverage', zValidator('query', neighborhoodCheckQuery), async (c) => {
  const { city, state, neighborhood } = c.req.valid('query');
  const covered = await cityAvailability.hasActiveRestaurantsInNeighborhood(city, state, neighborhood);
  return c.json({ city, state, neighborhood, covered });
});

export default route;
