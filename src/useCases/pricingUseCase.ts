import type { Additive } from '../types';

export function calculateDiscountPercent(originalPrice: number, currentPrice: number): number {
  return Math.round((1 - currentPrice / originalPrice) * 100);
}

export function calculateItemTotal(price: number, additives?: Additive[], selectedAdditiveIds?: Set<string>, quantity = 1): number {
  let total = price;
  if (additives && selectedAdditiveIds) {
    additives.forEach((a) => { if (selectedAdditiveIds.has(a.id)) total += a.price; });
  } else if (additives) {
    total += additives.reduce((sum, a) => sum + a.price, 0);
  }
  return total * quantity;
}