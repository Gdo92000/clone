import type { IOrderProvider } from './IOrderProvider';

export class MockOrderProvider implements IOrderProvider {
	name = 'mock';
}
