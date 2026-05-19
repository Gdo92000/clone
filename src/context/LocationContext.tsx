/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Coordinates } from '../hooks/useGeolocation';
import { getRegisteredCityCoverages, findRegisteredCityCoverage } from '../services/cityCoverageService';
import { progressiveGeolocation, ipFallback, readCache, writeCache, getCachedCoords, isGeolocationUsable } from '../services/geolocationService';
import { initialLocationState, locateCity, processSupportedCity, type LocationState } from '../providers/locationMachine';
import type { City } from '../services/locationService';

interface LocationContextValue extends LocationState {
  requestLocation: () => void;
  refreshLocation: () => void;
  setManualCity: (cityName: string) => void;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

function cityFromCache(cache: { city: { name: string; state: string; displayName: string; neighborhood?: string } }): City {
   const result: City = { name: cache.city.name, state: cache.city.state, stateCode: '', country: 'Brasil', displayName: cache.city.displayName };
   if (cache.city.neighborhood) result.neighborhood = cache.city.neighborhood;
   return result;
 }

export function LocationProvider({ children }: { children: ReactNode }) {
  const [s, set] = useState<LocationState>(initialLocationState);
  const activeRef = useRef(false);
  const hydrated = useRef(false);

  const setState = (patch: Partial<LocationState>) => { set((prev) => ({ ...prev, ...patch })); };

  const hydrateFromCache = useCallback(async () => {
    if (hydrated.current) return;
    hydrated.current = true;
    const cache = readCache();
    if (!cache) return;
    const detectedCity = cityFromCache(cache);
    const supported = await processSupportedCity(detectedCity, cache.coordinates);
    setState({ city: detectedCity, coordinates: cache.coordinates, source: cache.source, ...supported, status: 'SUCCESS', loading: false });
  }, []);

  const tryIpFallback = useCallback(async () => {
    setState({ loading: true, error: null, status: 'FALLBACK_IP' });
    try {
      const ipData = await ipFallback();
      if (ipData) {
        const detectedCity: City = { name: ipData.city, state: ipData.state, stateCode: '', country: 'Brasil', displayName: `${ipData.city} - ${ipData.state}` };
        const supported = await findRegisteredCityCoverage(detectedCity.name);
        setState({ city: detectedCity, coordinates: null, source: 'ip', isWithinSupportedCity: !!supported, distanceToCityCenter: null, status: 'FALLBACK_IP', loading: false, error: null });
      } else {
        setState({ status: 'ERROR', error: 'Não foi possível detectar sua cidade.', loading: false });
      }
    } catch { setState({ status: 'ERROR', error: 'Não foi possível detectar sua cidade.', loading: false }); }
  }, []);

  const processCoords = useCallback(async (coords: Coordinates) => {
    setState({ loading: true, error: null, status: 'REQUESTING' });
    try {
      const { city: detectedCity, source: citySource } = await locateCity(coords);
        const supported = await processSupportedCity(detectedCity, coords);
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
      setState({ city: detectedCity, coordinates: coords, source: citySource, ...supported, status: 'SUCCESS', loading: false });
    } catch { setState({ status: 'ERROR', error: 'Cidade não encontrada nas coordenadas obtidas.', loading: false }); }
  }, []);

  const requestLocation = useCallback(async () => {
    if (activeRef.current) return;
    activeRef.current = true;
    void hydrateFromCache();
    setState({ loading: true, error: null, status: 'REQUESTING' });

    if (!isGeolocationUsable() || (typeof window !== 'undefined' && !window.isSecureContext)) {
      await tryIpFallback(); activeRef.current = false; return;
    }

    try {
      const cached = getCachedCoords();
      if (cached) {
        await processCoords(cached); activeRef.current = false; return;
      }
    } catch { /* expired */ }
    try {
      const coords = await progressiveGeolocation();
      await processCoords(coords);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '';
      // Tratamento específico para timeout vs permissão negada
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

  const setManualCity = useCallback(async (cityName: string) => {
    const supported = await findRegisteredCityCoverage(cityName);
    if (supported) {
      setState({
         city: {
           name: supported.name,
           state: supported.state,
           stateCode: '',
           country: 'Brasil',
           displayName: `${supported.name} - ${supported.state}`,
         },
         coordinates: null,
         source: 'manual',
         isWithinSupportedCity: true,
         distanceToCityCenter: null,
         error: null,
         status: 'SUCCESS',
       });
    } else {
      const all = await getRegisteredCityCoverages();
      setState({ error: `Não temos estabelecimento em "${cityName}". Cidades: ${all.map((c) => c.name).join(', ')}` });
    }
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