export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

const NOMINATIM_SEARCH = 'https://nominatim.openstreetmap.org/search';

let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < 1100) {
    await new Promise((resolve) => setTimeout(resolve, 1100 - elapsed));
  }
  lastRequestTime = Date.now();
  return fetch(url);
}

export async function geocodeByQuery(query: string): Promise<GeocodeResult | null> {
  if (!query.trim()) return null;

  const url = `${NOMINATIM_SEARCH}q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`;

  try {
    const response = await rateLimitedFetch(url);
     if (!response.ok) return null;

     const data = await response.json() as unknown as { lat: string; lon: string; display_name: string }[];
     if (data.length === 0) return null;

    const first = data[0];
    if (!first) return null;

    return {
      lat: parseFloat(first.lat),
      lng: parseFloat(first.lon),
      displayName: first.display_name,
    };
  } catch {
    return null;
  }
}

export async function geocodeEstablishment(
  name: string,
  address: string,
  city: string,
  state: string,
): Promise<GeocodeResult | null> {
  // Tenta primeiro pelo nome + cidade
  const nameQuery = `${name}, ${city}, ${state}`;
  const byName = await geocodeByQuery(nameQuery);
  if (byName) return byName;

  // Fallback: endereço completo
  const addressQuery = `${address}, ${city}, ${state}`;
  return geocodeByQuery(addressQuery);
}