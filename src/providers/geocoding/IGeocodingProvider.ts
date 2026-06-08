import type { Coordinates } from '../../domain/geospatial/geodesy';

export interface ReverseGeocodeResult {
	city: string;
	state: string;
	stateCode?: string;
	country?: string;
	neighborhood?: string;
	postcode?: string;
	originalNeighborhood?: string;
	street?: string;
	number?: string;
	displayName: string;
}

export interface ForwardGeocodeResult {
	coordinates: Coordinates;
	displayName: string;
	street?: string;
	number?: string;
	confidence?: number;
}

export interface IGeocodingProvider {
	reverseGeocode(coordinates: Coordinates): Promise<ReverseGeocodeResult | null>;
	forwardGeocode(query: string): Promise<ForwardGeocodeResult | null>;
	readonly name: string;
}

export class GeocodingError extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly provider?: string,
	) {
		super(message);
		this.name = 'GeocodingError';
	}
}
