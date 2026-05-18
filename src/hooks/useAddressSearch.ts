import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchSuggestions, geocodeAddress, clearAddressCache } from '../services/addressAutocompleteService';
import type { AutocompleteSuggestion } from '../services/addressAutocompleteService';

const DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 3;

export interface AddressSearchResult {
  query: string;
  setQuery: (value: string) => void;
  suggestions: AutocompleteSuggestion[];
  selected: AutocompleteSuggestion | null;
  selectSuggestion: (suggestion: AutocompleteSuggestion) => Promise<void>;
  confirmAddress: () => Promise<void>;
  loading: boolean;
  geocoding: boolean;
  error: string | null;
  clear: () => void;
}

export function useAddressSearch(targetCity?: string): AddressSearchResult {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [selected, setSelected] = useState<AutocompleteSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const currentQueryRef = useRef('');

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const targetCityRef = useRef(targetCity);

  useEffect(() => {
    targetCityRef.current = targetCity;
  }, [targetCity]);

  const doSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    currentQueryRef.current = trimmed;

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const results = await fetchSuggestions(q, controller.signal, targetCityRef.current);

      if (!mountedRef.current) {
        return;
      }

      if (currentQueryRef.current !== trimmed) {
        return;
      }

      setSuggestions(results);
      setLoading(false);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        if (mountedRef.current) {
          setLoading(false);
        }
        return;
      }

      console.error('[useAddressSearch] Search error:', err);
      if (mountedRef.current) {
        setSuggestions([]);
        setError('Erro ao buscar endereços. Tente novamente.');
        setLoading(false);
      }
    }
  }, []);

  const handleSetQuery = useCallback((value: string) => {
    setQuery(value);
    setSelected(null);
    setError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = value.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      void doSearch(value);
    }, DEBOUNCE_MS);
  }, [doSearch]);

  const selectSuggestion = useCallback((suggestion: AutocompleteSuggestion): Promise<void> => {
    setSelected(suggestion);
    setQuery(suggestion.formattedAddress);
    setSuggestions([]);
    setError(null);
    return Promise.resolve();
  }, []);

  const confirmAddress = useCallback(async () => {
    if (!query.trim()) return;
    if (selected) return;

    setGeocoding(true);
    setError(null);

    try {
      const result = await geocodeAddress(query);
      if (result && mountedRef.current) {
        setSelected(result);
        setQuery(result.formattedAddress);
      } else if (mountedRef.current) {
        setError('Endereço não encontrado. Tente ser mais específico.');
      }
    } catch {
      if (mountedRef.current) {
        setError('Erro ao confirmar endereço.');
      }
    } finally {
      if (mountedRef.current) setGeocoding(false);
    }
  }, [query, selected]);

  const clear = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setSelected(null);
    setError(null);
    setLoading(false);
    setGeocoding(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();
    clearAddressCache();
  }, []);

  return {
    query,
    setQuery: handleSetQuery,
    suggestions,
    selected,
    selectSuggestion,
    confirmAddress,
    loading,
    geocoding,
    error,
    clear,
  };
}
