import type { Coordinates } from '../../domain/geospatial/geodesy';
import type { IGeocodingProvider, ReverseGeocodeResult, ForwardGeocodeResult } from './IGeocodingProvider';
import { GeocodingError } from './IGeocodingProvider';
import { logger } from '../../lib/logger';

interface NominatimReverseResponse {
	address?: {
		road?: string;
		pedestrian?: string;
		house_number?: string;
		building?: string;
		suburb?: string;
		neighbourhood?: string;
		quarter?: string;
		city_district?: string;
		city?: string;
		town?: string;
		village?: string;
		municipality?: string;
		county?: string;
		state?: string;
		'ISO3166-2'?: string;
		'ISO3166-2-lvl4'?: string;
		postcode?: string;
		country?: string;
	};
	display_name: string;
}

interface NominatimSearchResponse {
	lat: string;
	lon: string;
	display_name: string;
	importance?: number;
	address?: {
		road?: string;
		pedestrian?: string;
		house_number?: string;
		building?: string;
		city?: string;
		town?: string;
		village?: string;
		state?: string;
		suburb?: string;
		neighbourhood?: string;
		postcode?: string;
	};
}

function normalizeState(stateName: string): string {
	const stateMap: Record<string, string> = {
		Acre: 'AC', Alagoas: 'AL', 'Amapá': 'AP', Amazonas: 'AM',
		Bahia: 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF',
		'Espírito Santo': 'ES', Goiás: 'GO', Maranhão: 'MA',
		'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS',
		'Minas Gerais': 'MG', Pará: 'PA', Paraíba: 'PB',
		Paraná: 'PR', Pernambuco: 'PE', Piauí: 'PI',
		'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
		'Rio Grande do Sul': 'RS', Rondônia: 'RO', Roraima: 'RR',
		'Santa Catarina': 'SC', 'São Paulo': 'SP', Sergipe: 'SE',
		Tocantins: 'TO',
	};
	return stateMap[stateName] ?? stateName.substring(0, 2).toUpperCase();
}

function parseReverseResponse(data: NominatimReverseResponse): ReverseGeocodeResult | null {
	if (!data.address) return null;

	const a = data.address;
	const neighborhood =
		a['neighbourhood'] ?? a['suburb'] ?? a['quarter'] ?? a['city_district'] ?? undefined;

	const cityName =
		a['city'] ?? a['town'] ?? a['village'] ?? a['municipality'] ?? a['county'] ??
		data.display_name.split(',')[0] ?? 'Cidade Desconhecida';

	const stateName = a['state'] ?? 'Estado Desconhecido';
	const isoCode = (a['ISO3166-2-lvl4'] ?? a['ISO3166-2'])?.split('-')[1] ?? '';
	const stateCode = isoCode || normalizeState(stateName);
	const country = a['country'] ?? 'Brasil';

	const street = a['road'] ?? a['pedestrian'] ?? undefined;
	const number = a['house_number'] ?? undefined;

	const displayName = street
		? `${street}${number ? `, ${number}` : ''}\n${neighborhood ?? cityName} - ${stateCode || stateName}`
		: neighborhood
			? `${neighborhood}\n${cityName} - ${stateCode || stateName}`
			: `${cityName} - ${stateCode || stateName}`;

	const postcode = a['postcode']?.replace(/\D/g, '') || undefined;
	const result: ReverseGeocodeResult = {
		city: cityName,
		state: stateName,
		stateCode,
		country,
		displayName,
		...(street ? { street } : {}),
		...(number ? { number } : {}),
		...(postcode ? { postcode } : {}),
	};
	if (neighborhood) {
		result.neighborhood = neighborhood;
		result.originalNeighborhood = neighborhood;
	}
	return result;
}

export class NominatimGeocodingProvider implements IGeocodingProvider {
	name = 'nominatim';

	private baseUrl: string;
	private userAgent: string;

	constructor(options?: { baseUrl?: string; userAgent?: string }) {
		this.baseUrl = options?.baseUrl ?? '/api/nominatim';
		this.userAgent =
			options?.userAgent ?? 'FluxDelivery/1.0 (https://github.com/anomalyco/flux)';
	}

	async reverseGeocode(coordinates: Coordinates): Promise<ReverseGeocodeResult | null> {
		const url = new URL(`${this.baseUrl}/reverse`, window.location.origin);
		url.searchParams.set('lat', coordinates.latitude.toString());
		url.searchParams.set('lon', coordinates.longitude.toString());
		url.searchParams.set('format', 'json');
		url.searchParams.set('zoom', '18');
		url.searchParams.set('addressdetails', '1');
		url.searchParams.set('accept-language', 'pt-BR,pt');

		const res = await fetch(url.toString(), {
			headers: { 'User-Agent': this.userAgent },
		});

		if (!res.ok) {
			throw new GeocodingError(
				`HTTP ${res.status}: ${res.statusText}`,
				'HTTP_ERROR',
				this.name,
			);
		}

		const data = (await res.json()) as NominatimReverseResponse;
		return parseReverseResponse(data);
	}

	async forwardGeocode(query: string): Promise<ForwardGeocodeResult | null> {
		const url = new URL(`${this.baseUrl}/search`, window.location.origin);
		url.searchParams.set('q', query);
		url.searchParams.set('format', 'json');
		url.searchParams.set('limit', '1');
		url.searchParams.set('addressdetails', '1');
		url.searchParams.set('accept-language', 'pt-BR,pt');

		const res = await fetch(url.toString(), {
			headers: { 'User-Agent': this.userAgent },
		});

		if (!res.ok) {
			throw new GeocodingError(
				`HTTP ${res.status}: ${res.statusText}`,
				'HTTP_ERROR',
				this.name,
			);
		}

		const data = (await res.json()) as NominatimSearchResponse[];

		if (!Array.isArray(data) || data.length === 0) return null;

		const place = data[0];
		if (!place) return null;

		const coordinates = {
			latitude: parseFloat(place.lat),
			longitude: parseFloat(place.lon),
		};

		const street = place.address?.road ?? place.address?.pedestrian ?? undefined;
		const number = place.address?.house_number ?? undefined;

		const result: ForwardGeocodeResult = {
			coordinates,
			displayName: place.display_name,
			...(street ? { street } : {}),
			...(number ? { number } : {}),
		};

		if (place.importance !== undefined) {
			result.confidence = place.importance;
		}
		return result;
	}
}

interface PhotonSearchResponse {
	features?: {
		geometry: { coordinates: [number, number] };
		properties: {
			name?: string;
			street?: string;
			housenumber?: string;
			city?: string;
			state?: string;
			country?: string;
			postcode?: string;
			district?: string;
			suburb?: string;
			neighbourhood?: string;
		};
	}[];
}

export class PhotonGeocodingProvider implements IGeocodingProvider {
	name = 'photon';

	private baseUrl: string;

	constructor(options?: { baseUrl?: string }) {
		this.baseUrl = options?.baseUrl ?? '/api/photon';
	}

	async reverseGeocode(coordinates: Coordinates): Promise<ReverseGeocodeResult | null> {
		const url = new URL(this.baseUrl, window.location.origin);
		url.searchParams.set('lat', coordinates.latitude.toString());
		url.searchParams.set('lon', coordinates.longitude.toString());
		url.searchParams.set('limit', '1');

		const res = await fetch(url.toString());

		if (!res.ok) {
			throw new GeocodingError(
				`HTTP ${res.status}: ${res.statusText}`,
				'HTTP_ERROR',
				this.name,
			);
		}

		const data = (await res.json()) as PhotonSearchResponse;

		if (!data.features || data.features.length === 0) return null;

		const feature = data.features[0];
		if (!feature) return null;

		const props = feature.properties;
		const neighborhood =
			props.suburb ?? props.district ?? props.neighbourhood ?? undefined;

		const cityName = props.city ?? props.name ?? 'Cidade Desconhecida';
		const stateName = props.state ?? 'Estado Desconhecido';
		const stateCode = normalizeState(stateName);
		const country = props.country ?? 'Brasil';

		const displayName = neighborhood
			? `${neighborhood}\n${cityName} - ${stateCode || stateName}`
			: `${cityName} - ${stateCode || stateName}`;

		const photPostcode = props.postcode?.replace(/\D/g, '') || undefined;
		const street = props.name ?? props.street ?? undefined;
		const number = props.housenumber ?? undefined;
		const result: ReverseGeocodeResult = {
			city: cityName,
			state: stateName,
			stateCode,
			country,
			displayName,
			...(street ? { street } : {}),
			...(number ? { number } : {}),
			...(photPostcode ? { postcode: photPostcode } : {}),
		};
		if (neighborhood) {
			result.neighborhood = neighborhood;
			result.originalNeighborhood = neighborhood;
		}
		return result;
	}

	async forwardGeocode(query: string): Promise<ForwardGeocodeResult | null> {
		const url = new URL(this.baseUrl, window.location.origin);
		url.searchParams.set('q', query);
		url.searchParams.set('limit', '1');
		url.searchParams.set('lang', 'default');

		const res = await fetch(url.toString());

		if (!res.ok) {
			throw new GeocodingError(
				`HTTP ${res.status}: ${res.statusText}`,
				'HTTP_ERROR',
				this.name,
			);
		}

		const data = (await res.json()) as PhotonSearchResponse;

		if (!data.features || data.features.length === 0) return null;

		const feature = data.features[0];
		if (!feature) return null;

		const [lng, lat] = feature.geometry.coordinates;
		const coordinates = { latitude: lat, longitude: lng };

		const props = feature.properties;
		const street = props.name ?? props.street ?? undefined;
		const number = props.housenumber ?? undefined;
		const parts = [props.name, props.street, props.city, props.state, props.country].filter(
			(p): p is string => typeof p === 'string' && p.length > 0,
		);

		return {
			coordinates,
			displayName: parts.join(', ') || query,
			...(street ? { street } : {}),
			...(number ? { number } : {}),
		};
	}
}

export class FallbackGeocodingProvider implements IGeocodingProvider {
	name = 'fallback-chain';

	private providers: IGeocodingProvider[];
	private readonly maxRetries: number;
	private readonly baseDelayMs: number;
	private readonly maxDelayMs: number;

	constructor(
		providers: IGeocodingProvider[],
		options?: { maxRetries?: number; baseDelayMs?: number; maxDelayMs?: number },
	) {
		this.providers = providers;
		this.maxRetries = options?.maxRetries ?? 2;
		this.baseDelayMs = options?.baseDelayMs ?? 1000;
		this.maxDelayMs = options?.maxDelayMs ?? 4000;
	}

	private isRetryableError(error: GeocodingError): boolean {
		return error.code === 'HTTP_ERROR' || error.code === 'NETWORK_ERROR';
	}

	private async sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	private async withRetry<T>(
		fn: () => Promise<T>,
		providerName: string,
		context: string,
	): Promise<T> {
		let lastError: GeocodingError | null = null;

		for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
			try {
				return await fn();
			} catch (error) {
				const geocodingError =
					error instanceof GeocodingError
						? error
						: new GeocodingError(
								error instanceof Error ? error.message : 'Unknown',
								'NETWORK_ERROR',
								providerName,
							);

				lastError = geocodingError;

				if (attempt < this.maxRetries && this.isRetryableError(geocodingError)) {
					const delay = Math.min(
						this.baseDelayMs * Math.pow(2, attempt),
						this.maxDelayMs,
					);
					logger.warn('Geocoding', `Provider "${providerName}" attempt ${attempt + 1} failed, retrying in ${delay}ms`, {
						error: geocodingError.message,
						code: geocodingError.code,
						context,
					});
					await this.sleep(delay);
				} else {
					break;
				}
			}
		}

    throw lastError ?? new GeocodingError('All retries exhausted with no error captured', 'NETWORK_ERROR', providerName);
	}

	async reverseGeocode(coordinates: Coordinates): Promise<ReverseGeocodeResult | null> {
		let lastError: GeocodingError | null = null;

		for (const provider of this.providers) {
			try {
				const result = await this.withRetry(
					() => provider.reverseGeocode(coordinates),
					provider.name,
					`reverse(${coordinates.latitude},${coordinates.longitude})`,
				);
				if (result) {
					if (provider.name !== this.providers[0]?.name) {
						logger.info('Geocoding', `Fallback: "${provider.name}" succeeded for reverse geocode`, {
							lat: coordinates.latitude,
							lng: coordinates.longitude,
						});
					}
					return result;
				}
			} catch (error) {
				const geocodingError =
					error instanceof GeocodingError
						? error
						: new GeocodingError(
								error instanceof Error ? error.message : 'Unknown',
								'NETWORK_ERROR',
								provider.name,
							);
				lastError = geocodingError;
				logger.warn('Geocoding', `Provider "${provider.name}" failed for reverse geocode`, {
					error: geocodingError.message,
					code: geocodingError.code,
					lat: coordinates.latitude,
					lng: coordinates.longitude,
				});
			}
		}

		if (lastError) {
			throw new GeocodingError(
				`All providers failed. Last: ${lastError.message}`,
				'ALL_PROVIDERS_FAILED',
				this.name,
			);
		}

		return null;
	}

	async forwardGeocode(query: string): Promise<ForwardGeocodeResult | null> {
		let lastError: GeocodingError | null = null;

		for (const provider of this.providers) {
			try {
				const result = await this.withRetry(
					() => provider.forwardGeocode(query),
					provider.name,
					`forward("${query}")`,
				);
				if (result) {
					if (provider.name !== this.providers[0]?.name) {
						logger.info('Geocoding', `Fallback: "${provider.name}" succeeded for forward geocode`, { query });
					}
					return result;
				}
			} catch (error) {
				const geocodingError =
					error instanceof GeocodingError
						? error
						: new GeocodingError(
								error instanceof Error ? error.message : 'Unknown',
								'NETWORK_ERROR',
								provider.name,
							);
				lastError = geocodingError;
				logger.warn('Geocoding', `Provider "${provider.name}" failed for forward geocode`, {
					error: geocodingError.message,
					code: geocodingError.code,
					query,
				});
			}
		}

		if (lastError) {
			throw new GeocodingError(
				`All providers failed. Last: ${lastError.message}`,
				'ALL_PROVIDERS_FAILED',
				this.name,
			);
		}

		return null;
	}
}
