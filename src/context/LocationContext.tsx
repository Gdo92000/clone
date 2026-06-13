/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Coordinates } from '../types/location';

import { progressiveGeolocation, ipFallback, readCache, writeCache, getCachedCoords, isGeolocationUsable, isCacheStaleForCoords } from '../services/geolocationService';
import { citiesApi } from '../api/citiesApi';
import { initialLocationState, locateCity, calculateCoordConfidence, type CoordSource, type LocationState, type City } from '../providers/locationMachine';
import { logger } from '../lib/logger';
import { normalizeStateBR } from '../utils/states';

interface LocationContextValue extends LocationState {
  requestLocation: () => Promise<void>;
  refreshLocation: () => void;
  setManualCity: (cityName: string) => void;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

function cityFromCache(cache: { city: { name: string; state: string; displayName: string; neighborhood?: string } }): City {
   const normalizedState = normalizeStateBR(cache.city.state);
   const result: City = { name: cache.city.name, state: normalizedState, stateCode: normalizedState, country: 'Brasil', displayName: cache.city.displayName };
   if (cache.city.neighborhood) result.neighborhood = cache.city.neighborhood;
   return result;
 }

export function LocationProvider({ children }: { children: ReactNode }) {
  const [s, set] = useState<LocationState>(initialLocationState);
  const activeRef = useRef(false);
  const hydrated = useRef(false);

  const setState = (patch: Partial<LocationState>) => { set((prev) => ({ ...prev, ...patch })); };

const hydrateFromCache = useCallback(() => {
  if (hydrated.current) return;
  hydrated.current = true;
  const cache = readCache();
  if (!cache) return;
  try {
    const detectedCity = cityFromCache(cache);
    const cachedConfidence = calculateCoordConfidence(cache.coordinates.accuracy);
    setState({
      city: detectedCity,
      coordinates: cache.coordinates,
      source: cache.source,
      coord_source: 'cache',
      coord_confidence: cachedConfidence,
      isWithinSupportedCity: false,
      distanceToCityCenter: null,
      status: 'SUCCESS',
      loading: false,
    });
    } catch (error) {
      logger.warn('Location', 'Erro ao hidratar localização do cache', { error: error instanceof Error ? error.message : String(error) });
    }
}, []);

const tryIpFallback = useCallback(async () => {
  setState({ loading: true, error: null, status: 'FALLBACK_IP' });
  try {
    const ipData = await ipFallback();
    if (ipData) {
      const normalizedState = normalizeStateBR(ipData.state);
      const displayState = normalizedState || ipData.state;
      const detectedCity: City = {
        name: ipData.city,
        state: normalizedState,
        stateCode: normalizedState,
        country: 'Brasil',
        displayName: `${ipData.city} - ${displayState}`,
      };
      setState({
        city: detectedCity,
        coordinates: null,
        source: 'ip',
        coord_source: 'ip_fallback',
        coord_confidence: 0.20,
        isWithinSupportedCity: false,
        distanceToCityCenter: null,
        status: 'FALLBACK_IP',
        loading: false,
        error: null,
      });
    } else {
      setState({ status: 'ERROR', error: 'Não foi possível detectar sua cidade.', loading: false });
    }
  } catch (err) {
      logger.warn('Location', 'IP fallback failed', { error: err instanceof Error ? err.message : String(err) });
      setState({ status: 'ERROR', error: 'Não foi possível detectar sua cidade.', loading: false }); }
}, []);

  const processCoords = useCallback(async (coords: Coordinates) => {
    setState({ loading: true, error: null, status: 'REQUESTING' });
    try {
      const { city: detectedCity, source: citySource } = await locateCity(coords);
      const coordSource: CoordSource = citySource;
      const coordConfidence = calculateCoordConfidence(coords.accuracy);
      writeCache({
          city: {
            name: detectedCity.name,
            state: detectedCity.state,
            displayName: detectedCity.displayName,
            ...(detectedCity.neighborhood ? { neighborhood: detectedCity.neighborhood } : {}),
          },
          coordinates: coords,
          source: citySource,
          timestamp: Date.now(),
        });
      setState({
        city: detectedCity,
        coordinates: coords,
        source: citySource,
        coord_source: coordSource,
        coord_confidence: coordConfidence,
        isWithinSupportedCity: false,
        distanceToCityCenter: null,
        status: 'SUCCESS',
        loading: false,
      });
    } catch (err) {
      logger.warn('Location', 'Failed to process coordinates', { error: err instanceof Error ? err.message : String(err) });
      setState({ status: 'ERROR', error: 'Cidade não encontrada nas coordenadas obtidas.', loading: false }); }
  }, []);

  const requestLocation = useCallback(async () => {
    if (activeRef.current) return;
    activeRef.current = true;
    hydrateFromCache();
    setState({ loading: true, error: null, status: 'REQUESTING' });

    if (!isGeolocationUsable() || (typeof window !== 'undefined' && !window.isSecureContext)) {
      await tryIpFallback(); activeRef.current = false; return;
    }

    try {
      const cached = getCachedCoords();
      if (cached) {
        const fresh = await progressiveGeolocation();
        if (isCacheStaleForCoords(fresh)) {
          await processCoords(fresh); activeRef.current = false; return;
        }
        await processCoords(cached); activeRef.current = false; return;
      }
    } catch { /* expired */ }
    try {
      const coords = await progressiveGeolocation();
      await processCoords(coords);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '';
      if (errorMessage.includes('DENIED:1') || errorMessage.includes('DENIED:2')) {
        setState({ status: 'DENIED', error: 'Permissão de localização negada ou indisponível.' });
      } else if (errorMessage.includes('DENIED:3') || errorMessage.includes('TIMEOUT')) {
        setState({ status: 'DENIED', error: 'Tempo limite excedido ao obter localização.' });
      } else {
        setState({ status: 'DENIED', error: 'Permissão de localização negada.' });
      }
      void tryIpFallback();
    } finally { activeRef.current = false; }
  }, [processCoords, tryIpFallback, hydrateFromCache]);

  useEffect(() => { const t = setTimeout(() => void requestLocation(), 100); return () => { clearTimeout(t); }; }, [requestLocation]);

  const refreshLocation = useCallback(() => {
    setState(initialLocationState());
    activeRef.current = false; hydrated.current = false;
    void requestLocation();
  }, [requestLocation]);

  const setManualCity = useCallback((cityName: string) => {
    /* Try to look up city via API; fall back to marking as unsupported */
    void citiesApi.hasCityCoverage(cityName, '').then((covered) => {
      setState({
        city: {
          name: cityName,
          state: '',
          stateCode: '',
          country: 'Brasil',
          displayName: cityName,
        },
        coordinates: null,
        source: 'manual',
        coord_source: 'manual',
        coord_confidence: 1.0,
        isWithinSupportedCity: covered,
        distanceToCityCenter: null,
        error: covered ? null : `Não temos estabelecimento em "${cityName}".`,
        status: 'SUCCESS',
      });
    }).catch(() => {
      setState({
        city: { name: cityName, state: '', stateCode: '', country: 'Brasil', displayName: cityName },
        coordinates: null,
        source: 'manual',
        coord_source: 'manual',
        coord_confidence: 1.0,
        isWithinSupportedCity: false,
        distanceToCityCenter: null,
        error: `Não temos estabelecimento em "${cityName}".`,
        status: 'ERROR',
      });
    });
  }, []);

  const clearLocation = useCallback(() => { activeRef.current = false; setState(initialLocationState()); }, []);

  const value: LocationContextValue = { ...s, requestLocation, refreshLocation, setManualCity, clearLocation };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationContext(): LocationContextValue {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocationContext must be used within a LocationProvider');
  return context;
}