export interface KnownCity {
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  neighborhoods: string[];
}

export const KNOWN_CITIES: KnownCity[] = [
  { name: 'Franca', state: 'SP', latitude: -20.5386, longitude: -47.4008, neighborhoods: ['Centro', 'Jardim Paulista', 'Vila São Sebastião', 'Residencial São Gabriel', 'Parque Progresso', 'Jardim Lima', 'Vila Aparecida', 'Jardim Aeroporto'] },
  { name: 'São Paulo', state: 'SP', latitude: -23.5505, longitude: -46.6333, neighborhoods: ['Pinheiros', 'Jardins', 'Vila Madalena', 'Consolação', 'Bela Vista'] },
  { name: 'Ribeirão Preto', state: 'SP', latitude: -21.1699, longitude: -47.8099, neighborhoods: ['Centro', 'Alto da Boa Vista', 'Ribeirânia'] },
  { name: 'Belo Horizonte', state: 'MG', latitude: -19.9167, longitude: -43.9345, neighborhoods: ['Savassi', 'Funcionários', 'Lourdes', 'Serra', 'Pampulha'] },
  { name: 'Rio de Janeiro', state: 'RJ', latitude: -22.9068, longitude: -43.1729, neighborhoods: ['Copacabana', 'Ipanema', 'Leblon', 'Botafogo', 'Barra da Tijuca'] },
  { name: 'Curitiba', state: 'PR', latitude: -25.4284, longitude: -49.2733, neighborhoods: ['Centro', 'Batel', 'Alto da XV'] },
  { name: 'Salvador', state: 'BA', latitude: -12.9714, longitude: -38.5014, neighborhoods: ['Barra', 'Ondina', 'Rio Vermelho'] },
  { name: 'Brasília', state: 'DF', latitude: -15.7975, longitude: -47.8919, neighborhoods: ['Asa Sul', 'Asa Norte', 'Setor Comercial'] },
  { name: 'Recife', state: 'PE', latitude: -8.0476, longitude: -34.8770, neighborhoods: ['Boa Viagem', 'Recife Antigo', 'Casa Amarela'] },
  { name: 'Porto Alegre', state: 'RS', latitude: -30.0346, longitude: -51.2177, neighborhoods: ['Moinhos de Vento', 'Bela Vista', 'Centro Histórico'] },
  { name: 'Fortaleza', state: 'CE', latitude: -3.7172, longitude: -38.5433, neighborhoods: ['Meireles', 'Beira Mar', 'Centro'] },
];

export const KNOWN_CEPS = [
  { cep: '14400-000', city: 'Franca', state: 'SP' },
  { cep: '14401-000', city: 'Franca', state: 'SP' },
  { cep: '14405-000', city: 'Franca', state: 'SP' },
  { cep: '14406-543', city: 'Franca', state: 'SP' },
];
