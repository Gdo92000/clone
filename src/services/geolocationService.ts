import type { Coordinates } from '../hooks/useGeolocation';
import { storageService } from '../storage/storageService';

const CITY_CACHE_KEY = 'city-cache';
const CITY_TTL = 24 * 60 * 60 * 1000;
const COORDS_TTL = 60 * 60 * 1000;

export interface CachedLocation {
  city: { name: string; state: string; displayName: string; neighborhood?: string };
  coordinates: Coordinates;
  source: 'gps' | 'gps-fallback' | 'ip';
  timestamp: number;
}

export function readCache(): CachedLocation | null {
  try {
    const data = storageService.get(CITY_CACHE_KEY) as CachedLocation | null;
    if (!data) return null;
    const age = Date.now() - data.timestamp;
    if (age > CITY_TTL) {
      storageService.remove(CITY_CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function writeCache(data: CachedLocation): void {
   log('CACHE:write', JSON.stringify({
     city: data.city.displayName,
     neighborhood: data.city.neighborhood,
     source: data.source,
     accuracy: data.coordinates.accuracy?.toFixed(0),
     lat: data.coordinates.latitude.toFixed(6),
     lng: data.coordinates.longitude.toFixed(6),
   }));
   storageService.set(CITY_CACHE_KEY, data);
 }

export function getCachedCoords(): Coordinates | null {
  const data = readCache();
  if (!data) return null;
  const age = Date.now() - data.timestamp;
  return age < COORDS_TTL ? data.coordinates : null;
}

const DEBUG_KEY = 'geo-debug';
function log(...args: unknown[]) {
  try {
    const timestamp = new Date().toISOString().slice(11, 19);
    const entry = `[${timestamp}] ${args.join(' ')}`;
    const prev = (storageService.get(DEBUG_KEY) as string[] | null) ?? [];
    prev.push(entry);
    if (prev.length > 50) prev.shift();
    storageService.set(DEBUG_KEY, prev);
  } catch { /* ignore */ }
}

export function getGeoDebug(): string[] {
  return (storageService.get(DEBUG_KEY) as string[] | null) ?? [];
}

export function clearGeoDebug(): void {
  storageService.remove(DEBUG_KEY);
}

export function isGeolocationUsable(): boolean {
  if (typeof window === 'undefined') return false;
  log('isSecureContext:', window.isSecureContext);
  return true;
}

export function progressiveGeolocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    const MAX_READINGS = 3;
    const ACCURACY_THRESHOLD = 1000;
    const readings: { latitude: number; longitude: number; accuracy: number }[] = [];
    let completed = 0;
    let timedOut = false;

    log('GPS: iniciando coleta de 3 leituras com alta precisão');


    const timeoutId = setTimeout(() => {
      timedOut = true;
      log('GPS: tempo limite global excedido (25s)');
      processResults();
    }, 25000);

    function processResults() {
      clearTimeout(timeoutId);
      const valid = readings.filter((r) => r.accuracy <= ACCURACY_THRESHOLD);
      log(`GPS: leituras=${readings.length}, válidas=${valid.length}`);
      if (valid.length > 0) {
        const best = valid.reduce((a, b) => (a.accuracy <= b.accuracy ? a : b));
        const msg = `GPS: SUCESSO lat=${best.latitude}, lng=${best.longitude}, accuracy=${best.accuracy.toFixed(0)}m, source=gps`;
        log(msg);
        resolve({ latitude: best.latitude, longitude: best.longitude, accuracy: best.accuracy });
      } else if (readings.length > 0) {
        const best = readings.reduce((a, b) => (a.accuracy <= b.accuracy ? a : b));
        const msg = `GPS: SUCESSO (fora do limiar) lat=${best.latitude}, lng=${best.longitude}, accuracy=${best.accuracy.toFixed(0)}m, source=gps-fallback`;
        log(msg);
        resolve({ latitude: best.latitude, longitude: best.longitude, accuracy: best.accuracy });
      } else {
        reject(new Error('DENIED:0:Nenhuma leitura obtida'));
      }
    }

    function onReading(pos: GeolocationPosition) {
      if (timedOut) return;
      const acc = pos.coords.accuracy;
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      log(`GPS: leitura ${completed + 1}/3 acc=${acc.toFixed(0)}m lat=${lat}, lng=${lng}`);
      readings.push({ latitude: lat, longitude: lng, accuracy: acc });
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
      log(`GPS: ERRO code=${err.code}, message="${err.message}"`);
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

const IP_APIS = [
  {
    url: 'https://ipapi.co/json/',
    parse: (d: Record<string, unknown>) => {
      const city = d['city'];
      const region = d['region'];
      if (typeof city === 'string' && typeof region === 'string') {
        return { city, state: region };
      }
      return null;
    },
  },
  {
    url: 'https://ip-api.com/json/',
    parse: (d: Record<string, unknown>) => {
      const city = d['city'];
      const region = d['region'];
      if (typeof city === 'string' && typeof region === 'string') {
        return { city, state: region };
      }
      return null;
    },
  },
];

export async function ipFallback(): Promise<{ city: string; state: string } | null> {
  for (const api of IP_APIS) {
    try {
      log(`IP: tentando ${api.url}`);
      const res = await fetch(api.url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) {
        log(`IP: ${api.url} status=${res.status}`);
        continue;
      }
      const data = await res.json() as Record<string, unknown>;
      const result = api.parse(data);
      if (result) {
        log(`IP: SUCESSO via ${api.url} -> ${result.city}/${result.state}`);
        return result;
      }
      log(`IP: ${api.url} dados incompletos`);
    } catch (e) {
      log(`IP: ${api.url} erro — ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  log('IP: TODAS AS APIs FALHARAM');
  return null;
}

export function validateCity(city: string): boolean {
  if (!city || typeof city !== 'string') return false;
  const trimmed = city.trim();
  if (trimmed.length < 2) return false;
  return true;
}