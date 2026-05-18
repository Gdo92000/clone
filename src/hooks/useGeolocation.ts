import { useCallback, useState } from 'react';

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

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

/**
 * Realiza 3 leituras consecutivas da geolocalização e retorna a de menor accuracy.
 * Ignora leituras acima de 1000m de precisão.
 */
function progressiveGeolocation(): Promise<Coordinates> {
  const MAX_READINGS = 3;
  const ACCURACY_THRESHOLD = 1000;
  const readings: { latitude: number; longitude: number; accuracy: number }[] = [];
  let completed = 0;
  let timedOut = false;
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      timedOut = true;
      processResults();
    }, 25000);

    function processResults() {
      clearTimeout(timeoutId);
      const valid = readings.filter((r) => r.accuracy <= ACCURACY_THRESHOLD);
      if (valid.length > 0) {
        const best = valid.reduce((a, b) => (a.accuracy <= b.accuracy ? a : b));
        resolve({ latitude: best.latitude, longitude: best.longitude, accuracy: best.accuracy });
      } else if (readings.length > 0) {
        const best = readings.reduce((a, b) => (a.accuracy <= b.accuracy ? a : b));
        resolve({ latitude: best.latitude, longitude: best.longitude, accuracy: best.accuracy });
      } else {
        reject(new Error('DENIED:0:Nenhuma leitura obtida'));
      }
    }

    function onReading(pos: GeolocationPosition) {
      if (timedOut) return;
      const acc = pos.coords.accuracy;
      readings.push({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: acc,
      });
      completed++;
      if (completed >= MAX_READINGS) {
        processResults();
      } else {
        setTimeout(() => {
          if (!timedOut) {
            navigator.geolocation.getCurrentPosition(onReading, onError, {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 0,
            });
          }
        }, 500);
      }
    }

    function onError(err: GeolocationPositionError) {
      if (timedOut) return;
      if (err.code !== 0) {
        clearTimeout(timeoutId);
        reject(new Error(`DENIED:${err.code}:${err.message}`));
        return;
      }
      completed++;
      if (completed >= MAX_READINGS) {
        processResults();
      } else {
        setTimeout(() => {
          if (!timedOut) {
            navigator.geolocation.getCurrentPosition(onReading, onError, {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 0,
            });
          }
        }, 500);
      }
    }

    navigator.geolocation.getCurrentPosition(onReading, onError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
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
      .catch((err) => {
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