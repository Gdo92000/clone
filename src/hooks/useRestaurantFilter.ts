import { useState, useMemo, useEffect, useRef } from 'react';
import { getRestaurants, getCategories } from '../repositories/restaurantRepository';
import type { Restaurant, Category } from '../types';

const sortOptions = [
  { id: 'relevance', label: 'Relevância' },
  { id: 'rating', label: 'Avaliação' },
  { id: 'delivery', label: 'Tempo de entrega' },
  { id: 'distance', label: 'Distância' },
];

interface UseRestaurantFilterOptions {
  initialQuery?: string;
  initialSort?: string;
}

export function useRestaurantFilter(options?: UseRestaurantFilterOptions) {
  const [query, setQuery] = useState(options?.initialQuery ?? '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<string | null>(options?.initialSort ?? 'relevance');
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    void Promise.all([getRestaurants(), getCategories()])
      .then(([r, c]) => { setAllRestaurants(r); setAllCategories(c); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    let results = [...allRestaurants];

    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(
        (r) => r.name.toLowerCase().includes(lowerQuery) ||
          r.cuisine.toLowerCase().includes(lowerQuery) ||
          r.description.toLowerCase().includes(lowerQuery)
      );
    }

    if (selectedCategory) {
      const category = allCategories.find((c) => c.slug === selectedCategory);
      if (category) {
        results = results.filter((r) => r.cuisine.toLowerCase() === category.name.toLowerCase());
      }
    }

    switch (selectedSort) {
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'delivery':
        results.sort((a, b) => {
          const aTime = parseInt(a.deliveryTime.split('-')[0] ?? '0');
          const bTime = parseInt(b.deliveryTime.split('-')[0] ?? '0');
          return aTime - bTime;
        });
        break;
      case 'distance':
        results.sort((a, b) => {
          const aDist = parseFloat(a.distance);
          const bDist = parseFloat(b.distance);
          return aDist - bDist;
        });
        break;
    }

    return results;
  }, [query, selectedCategory, selectedSort, allRestaurants, allCategories]);

  return { query, setQuery, selectedCategory, setSelectedCategory, selectedSort, setSelectedSort, filtered, sortOptions, categories: allCategories, loading };
}

export function useRestaurantSearch(options?: UseRestaurantFilterOptions) {
  const filter = useRestaurantFilter(options);
  return { ...filter, filteredRestaurants: filter.filtered };
}