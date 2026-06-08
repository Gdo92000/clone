import type { ViaCepResponse } from 'src/api/viaCepApi';

interface ViaCepApiClient {
  lookup: (cep: string) => Promise<ViaCepResponse>;
  lookupByAddress: (uf: string, localidade: string, logradouro: string) => Promise<ViaCepResponse[]>;
}

export class CepLookupService {
  constructor(private readonly api: ViaCepApiClient) {}

  async lookup(cep: string): Promise<ViaCepResponse> {
    return this.api.lookup(cep);
  }

  async lookupByAddress(uf: string, localidade: string, logradouro: string): Promise<ViaCepResponse[]> {
    return this.api.lookupByAddress(uf, localidade, logradouro);
  }
}
