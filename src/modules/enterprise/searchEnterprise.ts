import type { DemoProduct } from './types';

export interface EnterpriseFilters {
  query?: string;
  categoryId?: string;
  cuisine?: string;
  veganOnly?: boolean;
  vegetarianOnly?: boolean;
  availableOnly?: boolean;
  minRating?: number;
  maxPrice?: number;
  promotionsOnly?: boolean;
}

export function filterDemoProducts(products: DemoProduct[], filters: EnterpriseFilters) {
  const query = filters.query?.trim().toLowerCase();

  return products.filter((product) => {
    const matchesQuery =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.tags.some((tag) => tag.toLowerCase().includes(query));
    const matchesCategory = !filters.categoryId || product.categoryId === filters.categoryId;
    const matchesVegan = !filters.veganOnly || product.tags.includes('vegano');
    const matchesVegetarian = !filters.vegetarianOnly || product.tags.includes('vegetariano');
    const matchesAvailability = !filters.availableOnly || product.available;
    const matchesPrice = !filters.maxPrice || product.basePrice <= filters.maxPrice;
    const matchesPromotion = !filters.promotionsOnly || product.tags.includes('promo');

    return (
      matchesQuery &&
      matchesCategory &&
      matchesVegan &&
      matchesVegetarian &&
      matchesAvailability &&
      matchesPrice &&
      matchesPromotion
    );
  });
}
