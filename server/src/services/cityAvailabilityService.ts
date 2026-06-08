import { eq } from 'drizzle-orm';
import { db, getRegistry } from '../db';
import { restaurants } from '../db/schema/core';
import { getProvider } from '../db/provider-selector';

export interface ActiveCity {
  city: string;
  state: string;
  restaurant_count: number;
}

export interface ActiveNeighborhood {
  neighborhood: string;
  city: string;
  state: string;
  restaurant_count: number;
}

interface RestaurantLocationRow {
  city: string | null;
  state: string | null;
  neighborhood: string | null;
}

function readFromMemory(): RestaurantLocationRow[] {
  const registry = getRegistry() as unknown as {
    repos: { restaurants: { snapshot: () => RestaurantLocationRow[] } };
  };
  return registry.repos.restaurants.snapshot();
}

async function getActiveRestaurants(): Promise<RestaurantLocationRow[]> {
  const provider = (() => { try { return getProvider(); } catch { return null; } })();
  if (provider === 'memory') {
    return readFromMemory();
  }
  return db
    .select({ city: restaurants.city, state: restaurants.state, neighborhood: restaurants.neighborhood })
    .from(restaurants)
    .where(eq(restaurants.is_active, true));
}

export async function listActiveCities(): Promise<ActiveCity[]> {
  const rows = await getActiveRestaurants();
  const groups = new Map<string, ActiveCity>();
  for (const r of rows) {
    if (!r.city || !r.state) continue;
    const key = `${r.city}|${r.state}`;
    const existing = groups.get(key);
    if (existing) {
      existing.restaurant_count += 1;
    } else {
      groups.set(key, { city: r.city, state: r.state, restaurant_count: 1 });
    }
  }
  return [...groups.values()].sort((a, b) => a.city.localeCompare(b.city, 'pt-BR'));
}

export async function listActiveNeighborhoods(city: string, state: string): Promise<ActiveNeighborhood[]> {
  const rows = await getActiveRestaurants();
  const groups = new Map<string, ActiveNeighborhood>();
  for (const r of rows) {
    if (!r.city || !r.state) continue;
    if (r.city.toLowerCase() !== city.toLowerCase() || r.state.toUpperCase() !== state.toUpperCase()) continue;
    if (!r.neighborhood) continue;
    const existing = groups.get(r.neighborhood);
    if (existing) {
      existing.restaurant_count += 1;
    } else {
      groups.set(r.neighborhood, { neighborhood: r.neighborhood, city: r.city, state: r.state, restaurant_count: 1 });
    }
  }
  return [...groups.values()].sort((a, b) => a.neighborhood.localeCompare(b.neighborhood, 'pt-BR'));
}

export async function hasActiveRestaurantsInCity(city: string, state: string): Promise<boolean> {
  const rows = await getActiveRestaurants();
  return rows.some(
    (r) =>
      r.city?.toLowerCase() === city.toLowerCase() &&
      r.state?.toUpperCase() === state.toUpperCase(),
  );
}

export async function hasActiveRestaurantsInNeighborhood(
  city: string,
  state: string,
  neighborhood: string,
): Promise<boolean> {
  const rows = await getActiveRestaurants();
  return rows.some(
    (r) =>
      r.city?.toLowerCase() === city.toLowerCase() &&
      r.state?.toUpperCase() === state.toUpperCase() &&
      r.neighborhood?.toLowerCase() === neighborhood.toLowerCase(),
  );
}

export async function setRestaurantAvailability(
  id: string,
  isActive: boolean,
): Promise<{ id: string; is_active: boolean } | null> {
  const provider = (() => { try { return getProvider(); } catch { return null; } })();
  if (provider === 'memory') {
    return { id, is_active: isActive };
  }
  const updated = await db
    .update(restaurants)
    .set({ is_active: isActive, updated_at: new Date() })
    .where(eq(restaurants.id, id))
    .returning({ id: restaurants.id, is_active: restaurants.is_active });
  return updated[0] ?? null;
}
