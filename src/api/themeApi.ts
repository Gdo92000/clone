import { get } from './httpClient';

export const themeApi = {
  getMyTheme: () => get<Record<string, unknown>>('/theme/me/theme'),
};
