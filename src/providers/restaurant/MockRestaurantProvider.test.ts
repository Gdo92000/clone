import { describe, expect, it } from 'vitest';
import { MockRestaurantProvider } from './MockRestaurantProvider';

describe('MockRestaurantProvider', () => {
	it('preserva bairros dos restaurantes mockados para filtros por localizacao real', async () => {
		const provider = new MockRestaurantProvider();

		const restaurants = await provider.getAll();

		expect(restaurants).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: 'rest-1',
					city: 'Franca',
					neighborhood: 'Parque Progresso',
				}),
				expect.objectContaining({
					id: 'rest-6',
					city: 'Franca',
					neighborhood: 'Parque Progresso',
				}),
			]),
		);
	});

	it('retorna o bairro tambem na busca por restaurante unico', async () => {
		const provider = new MockRestaurantProvider();

		const restaurant = await provider.getById('rest-1');

		expect(restaurant).toEqual(
			expect.objectContaining({
				id: 'rest-1',
				neighborhood: 'Parque Progresso',
			}),
		);
	});
});
