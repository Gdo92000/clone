import type { IRestaurantProvider } from './IRestaurantProvider';
import { HttpRestaurantProvider } from './HttpRestaurantProvider';
import { MockRestaurantProvider } from './MockRestaurantProvider';
import { isMockRestaurants } from '../flags';

let instance: IRestaurantProvider | null = null;

export function getRestaurantProvider(): IRestaurantProvider {
	if (!instance) {
		instance = isMockRestaurants()
			? new MockRestaurantProvider()
			: new HttpRestaurantProvider();
	}
	return instance;
}

export function resetRestaurantProvider(): void {
	instance = null;
}
