interface ThemeApiClient {
  getMyTheme: () => Promise<Record<string, unknown>>;
}

export class ThemeApiService {
  constructor(private readonly api: ThemeApiClient) {}

  async getMyTheme(): Promise<Record<string, unknown>> {
    return this.api.getMyTheme();
  }
}
