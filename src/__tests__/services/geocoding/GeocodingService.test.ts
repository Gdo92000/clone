import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GeocodingService } from '../../../services/geocoding/GeocodingService';
import { GeocodingError } from '../../../providers/geocoding';
import type { IGeocodingProvider, ReverseGeocodeResult, ForwardGeocodeResult } from '../../../providers/geocoding';

class StubGeocodingProvider implements IGeocodingProvider {
	name = 'stub';
	private reverseResult: ReverseGeocodeResult | null = null;
	private forwardResult: ForwardGeocodeResult | null = null;

	setReverseResult(result: ReverseGeocodeResult | null): void {
		this.reverseResult = result;
	}

	setForwardResult(result: ForwardGeocodeResult | null): void {
		this.forwardResult = result;
	}

	async reverseGeocode(): Promise<ReverseGeocodeResult | null> {
		return await Promise.resolve(this.reverseResult);
	}

	async forwardGeocode(): Promise<ForwardGeocodeResult | null> {
		return await Promise.resolve(this.forwardResult);
	}
}

class FailingGeocodingProvider implements IGeocodingProvider {
	name = 'failing';

	async reverseGeocode(): Promise<ReverseGeocodeResult | null> {
		await Promise.resolve();
		throw new GeocodingError('Service unavailable', 'HTTP_ERROR', this.name);
	}

	async forwardGeocode(): Promise<ForwardGeocodeResult | null> {
		await Promise.resolve();
		throw new GeocodingError('Service unavailable', 'HTTP_ERROR', this.name);
	}
}

describe('GeocodingService', () => {
	let service: GeocodingService;
	let stubProvider: StubGeocodingProvider;

	beforeEach(() => {
		stubProvider = new StubGeocodingProvider();
		service = new GeocodingService(stubProvider);
	});

	afterEach(() => {
		service.clearCache();
	});

	describe('reverseGeocode', () => {
		it('deve retornar cidade de São Paulo para coordenadas de SP', async () => {
			stubProvider.setReverseResult({
				city: 'São Paulo',
				state: 'São Paulo',
				stateCode: 'SP',
				country: 'Brasil',
				neighborhood: 'Pinheiros',
				displayName: 'Pinheiros\nSão Paulo - SP',
			});

			const result = await service.reverseGeocode({
				latitude: -23.5505,
				longitude: -46.6333,
			});
			expect(result).not.toBeNull();
			if (result) {
				expect(result.city).toBe('São Paulo');
				expect(result.stateCode).toBe('SP');
				expect(result.neighborhood).toBe('Pinheiros');
			}
		});

		it('deve cachear resultado posterior', async () => {
			stubProvider.setReverseResult({
				city: 'Franca',
				state: 'São Paulo',
				stateCode: 'SP',
				country: 'Brasil',
				displayName: 'Franca - SP',
			});

			const coords = { latitude: -20.5386, longitude: -47.4008 };
			const result1 = await service.reverseGeocode(coords);
			expect(result1).not.toBeNull();

			const start = Date.now();
			const result2 = await service.reverseGeocode(coords);
			const elapsed = Date.now() - start;

			expect(result2).not.toBeNull();
			if (result2 && result1) {
				expect(result2.city).toBe(result1.city);
			}
			expect(elapsed).toBeLessThan(100);
		});

		it('deve propagar GeocodingError do provider', async () => {
			const failingProvider = new FailingGeocodingProvider();
			const failingService = new GeocodingService(failingProvider);

			await expect(
				failingService.reverseGeocode({ latitude: -23.5, longitude: -46.6 }),
			).rejects.toThrow('Service unavailable');
		});
	});

	describe('forwardGeocode', () => {
		it('deve retornar resultado do provider', async () => {
			stubProvider.setForwardResult({
				coordinates: { latitude: -23.5505, longitude: -46.6333 },
				displayName: 'São Paulo, SP, Brasil',
				confidence: 0.8,
			});

			const result = await service.forwardGeocode('São Paulo, SP');
			expect(result).not.toBeNull();
			if (result) {
				expect(result.displayName).toContain('São Paulo');
				expect(result.confidence).toBe(0.8);
			}
		});
	});
});
