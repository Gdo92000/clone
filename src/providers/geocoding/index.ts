import type { IGeocodingProvider } from './IGeocodingProvider';
import { NominatimGeocodingProvider, PhotonGeocodingProvider, FallbackGeocodingProvider } from './GeocodingProviders';

let instance: IGeocodingProvider | null = null;

export function getGeocodingProvider(): IGeocodingProvider {
	if (!instance) {
		instance = new FallbackGeocodingProvider([
			new NominatimGeocodingProvider(),
			new PhotonGeocodingProvider(),
		]);
	}
	return instance;
}

export function resetGeocodingProvider(): void {
	instance = null;
}

export type { IGeocodingProvider, ReverseGeocodeResult, ForwardGeocodeResult } from './IGeocodingProvider';

export { GeocodingError } from './IGeocodingProvider';

export { NominatimGeocodingProvider, PhotonGeocodingProvider, FallbackGeocodingProvider } from './GeocodingProviders';
