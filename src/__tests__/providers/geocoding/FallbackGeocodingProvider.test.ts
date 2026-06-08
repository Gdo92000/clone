import { describe, it, expect } from 'vitest';
import { FallbackGeocodingProvider, NominatimGeocodingProvider, PhotonGeocodingProvider } from '../../../providers/geocoding/GeocodingProviders';
import { GeocodingError } from '../../../providers/geocoding/IGeocodingProvider';
import type { IGeocodingProvider, ReverseGeocodeResult, ForwardGeocodeResult } from '../../../providers/geocoding/IGeocodingProvider';

class StubProvider implements IGeocodingProvider {
	name: string;
	private reverseResult: ReverseGeocodeResult | null = null;
	private forwardResult: ForwardGeocodeResult | null = null;
	private shouldFail = false;

	constructor(name: string, opts?: { fail?: boolean; reverseResult?: ReverseGeocodeResult | null; forwardResult?: ForwardGeocodeResult | null }) {
		this.name = name;
		if (opts?.fail) this.shouldFail = true;
		if (opts?.reverseResult !== undefined) this.reverseResult = opts.reverseResult;
		if (opts?.forwardResult !== undefined) this.forwardResult = opts.forwardResult;
	}

	async reverseGeocode(): Promise<ReverseGeocodeResult | null> {
		if (this.shouldFail) throw new GeocodingError('fail', 'HTTP_ERROR', this.name);
		return await Promise.resolve(this.reverseResult);
	}

	async forwardGeocode(): Promise<ForwardGeocodeResult | null> {
		if (this.shouldFail) throw new GeocodingError('fail', 'HTTP_ERROR', this.name);
		return await Promise.resolve(this.forwardResult);
	}
}

describe('FallbackGeocodingProvider', () => {
	it('usa primeiro provider quando succeeds', async () => {
		const primary = new StubProvider('primary', {
			reverseResult: { city: 'São Paulo', state: 'SP', stateCode: 'SP', displayName: 'SP' },
			forwardResult: { coordinates: { latitude: -23.5, longitude: -46.6 }, displayName: 'SP' },
		});
		const fallback = new StubProvider('fallback', {
			reverseResult: { city: 'Rio', state: 'RJ', stateCode: 'RJ', displayName: 'RJ' },
		});

		const chain = new FallbackGeocodingProvider([primary, fallback]);

		const result = await chain.reverseGeocode({ latitude: -23.5, longitude: -46.6 });
		expect(result?.city).toBe('São Paulo');
	});

	it('fallback para segundo provider quando primeiro falha', async () => {
		const primary = new StubProvider('primary', { fail: true });
		const fallback = new StubProvider('fallback', {
			reverseResult: { city: 'Rio de Janeiro', state: 'RJ', stateCode: 'RJ', displayName: 'RJ' },
			forwardResult: { coordinates: { latitude: -22.9, longitude: -43.1 }, displayName: 'RJ' },
		});

		const chain = new FallbackGeocodingProvider([primary, fallback]);

		const result = await chain.reverseGeocode({ latitude: -22.9, longitude: -43.1 });
		expect(result?.city).toBe('Rio de Janeiro');
	});

	it('throws quando todos os providers falham', async () => {
		const primary = new StubProvider('primary', { fail: true });
		const fallback = new StubProvider('fallback', { fail: true });

		const chain = new FallbackGeocodingProvider([primary, fallback], { maxRetries: 1, baseDelayMs: 100 });

		await expect(
			chain.reverseGeocode({ latitude: 0, longitude: 0 }),
		).rejects.toThrow('All providers failed');
	}, 10000);

	it('returns null quando todos providers retornam null', async () => {
		const primary = new StubProvider('primary', { reverseResult: null });
		const fallback = new StubProvider('fallback', { reverseResult: null });

		const chain = new FallbackGeocodingProvider([primary, fallback]);

		const result = await chain.reverseGeocode({ latitude: 0, longitude: 0 });
		expect(result).toBeNull();
	});

	it('forward geocode fallback funciona igual', async () => {
		const primary = new StubProvider('primary', { fail: true });
		const fallback = new StubProvider('fallback', {
			forwardResult: { coordinates: { latitude: -22.9, longitude: -43.1 }, displayName: 'RJ' },
		});

		const chain = new FallbackGeocodingProvider([primary, fallback]);

		const result = await chain.forwardGeocode('Rio de Janeiro');
		expect(result?.displayName).toBe('RJ');
	});
});

describe('NominatimGeocodingProvider', () => {
	it('tem nome "nominatim"', () => {
		const provider = new NominatimGeocodingProvider();
		expect(provider.name).toBe('nominatim');
	});
});

describe('PhotonGeocodingProvider', () => {
	it('tem nome "photon"', () => {
		const provider = new PhotonGeocodingProvider();
		expect(provider.name).toBe('photon');
	});
});
