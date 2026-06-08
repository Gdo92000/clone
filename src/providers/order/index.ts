import type { IOrderProvider } from './IOrderProvider';
import { HttpOrderProvider } from './HttpOrderProvider';
import { MockOrderProvider } from './MockOrderProvider';
import { isMockOrders } from '../flags';

let instance: IOrderProvider | null = null;

export function getOrderProvider(): IOrderProvider {
	if (!instance) {
		instance = isMockOrders()
			? new MockOrderProvider()
			: new HttpOrderProvider();
	}
	return instance;
}

export function resetOrderProvider(): void {
	instance = null;
}
