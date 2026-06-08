import type { IOrderProvider } from './IOrderProvider';

export class HttpOrderProvider implements IOrderProvider {
	name = 'http';
}
