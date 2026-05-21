import { eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { coverageCities } from '../db/schema/ops/coverage';
import { restaurants } from '../db/schema/core';

export interface CoverageCityInput {
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  radiusKm?: number;
}

export async function listCoverageCities() {
  return db.select().from(coverageCities).where(eq(coverageCities.is_active, true)).orderBy(coverageCities.name);
}

export async function getCoverageCity(id: string) {
  const result = await db.select().from(coverageCities).where(eq(coverageCities.id, id)).limit(1);
  if (result.length === 0) return null;
  return result[0];
}

export async function createCoverageCity(input: CoverageCityInput) {
  const id = `city-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  await db.insert(coverageCities).values({ id, ...input, radius_km: input.radiusKm ?? 18, restaurant_count: 0 });
  return getCoverageCity(id);
}

export async function updateCoverageCity(id: string, input: Partial<CoverageCityInput>) {
  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.state !== undefined) updateData.state = input.state;
  if (input.latitude !== undefined) updateData.latitude = String(input.latitude);
  if (input.longitude !== undefined) updateData.longitude = String(input.longitude);
  if (input.radiusKm !== undefined) updateData.radius_km = input.radiusKm;
  if (Object.keys(updateData).length === 0) return getCoverageCity(id);
  await db.update(coverageCities).set(updateData).where(eq(coverageCities.id, id));
  return getCoverageCity(id);
}

export async function toggleCoverageCity(id: string) {
  const city = await getCoverageCity(id);
  if (!city) return null;
  const newStatus = !city.is_active;
  await db.update(coverageCities).set({ is_active: newStatus }).where(eq(coverageCities.id, id));
  return { ...city, is_active: newStatus };
}

export async function deleteCoverageCity(id: string) {
  await db.delete(coverageCities).where(eq(coverageCities.id, id));
}

export async function seedFromRestaurants() {
  const existing = await db.select({ count: sql<number>`count(*)` }).from(coverageCities);
  if (existing[0]?.count > 0) return { seeded: 0, reason: 'already_seeded' };

  const all = await db.select({ city: restaurants.city }).from(restaurants).where(sql`${restaurants.city} IS NOT NULL`);
  const unique = [...new Set(all.map((r) => r.city))];
  if (unique.length === 0) return { seeded: 0, reason: 'no_restaurants' };

  let seeded = 0;
  for (const name of unique) {
    const id = `city-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    await db.insert(coverageCities).values({ id, name, state: 'SP', latitude: '0', longitude: '0', radius_km: 18, restaurant_count: 0 }).onConflictDoNothing();
    seeded++;
  }
  return { seeded };
}
