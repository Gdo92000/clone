import { useCallback, useState } from 'react';
import type { Coordinates } from '../types/location';
import { progressiveGeolocation } from '../services/geolocationService';

export type { Coordinates };

export interface GeolocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED';
  message: string;
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface UseGeolocationReturn {
  coordinates: Coordinates | null;
  error: GeolocationError | null;
  loading: boolean;
  requestLocation: () => void;
  refreshLocation: () => void;
}

function getGeolocationError(
  code: number,
  message: string
): GeolocationError {
  switch (code) {
    case 1:
      return { code: 'PERMISSION_DENIED', message: 'Permissão de localização negada' };
    case 2:
      return { code: 'POSITION_UNAVAILABLE', message: 'Localização indisponível' };
    case 3:
      return { code: 'TIMEOUT', message: 'Tempo limite excedido. Tente novamente.' };
    default:
      return { code: 'POSITION_UNAVAILABLE', message: message || 'Erro desconhecido' };
  }
}

export function useGeolocation(
  _options?: UseGeolocationOptions
): UseGeolocationReturn {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    progressiveGeolocation()
      .then((coords) => {
        setCoordinates(coords);
        setLoading(false);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        const codeMatch = message.match(/^DENIED:(\d+):/);
        if (codeMatch && codeMatch[1]) {
          const code = parseInt(codeMatch[1], 10);
          const geolocationError = getGeolocationError(code, message.replace(/^DENIED:\d+:/, ''));
          setError(geolocationError);
        } else {
          setError({ code: 'POSITION_UNAVAILABLE', message });
        }
        setLoading(false);
      });
  }, []);

  const refreshLocation = useCallback(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    coordinates,
    error,
    loading,
    requestLocation,
    refreshLocation,
  };
}