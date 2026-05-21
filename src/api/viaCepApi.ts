import { httpClient } from './httpClient';

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  unidade: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado: string;
  regiao: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export const viaCepApi = {
  lookup: (cep: string): Promise<ViaCepResponse> => {
    return httpClient.get<ViaCepResponse>(`/api/viacep/ws/${cep}/json/`);
  },

  lookupByAddress: (uf: string, localidade: string, logradouro: string): Promise<ViaCepResponse[]> => {
    return httpClient.get<ViaCepResponse[]>(`/api/viacep/ws/${uf}/${localidade}/${logradouro}/json/`);
  }
};