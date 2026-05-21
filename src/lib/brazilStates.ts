export const BRAZIL_STATES: Record<string, string> = {
  'são paulo': 'SP',
  'sao paulo': 'SP',
  'rio de janeiro': 'RJ',
  'minas gerais': 'MG',
  'bahia': 'BA',
  'paraná': 'PR',
  'parana': 'PR',
  'rio grande do sul': 'RS',
  'pernambuco': 'PE',
  'ceará': 'CE',
  'ceara': 'CE',
  'pará': 'PA',
  'para': 'PA',
  'maranhão': 'MA',
  'maranhao': 'MA',
  'goiás': 'GO',
  'goias': 'GO',
  'espírito santo': 'ES',
  'espirito santo': 'ES',
  'paraíba': 'PB',
  'paraiba': 'PB',
  'santa catarina': 'SC',
  'mato grosso': 'MT',
  'mato grosso do sul': 'MS',
  'piauí': 'PI',
  'piaui': 'PI',
  'alagoas': 'AL',
  'distrito federal': 'DF',
  'sergipe': 'SE',
  'rondônia': 'RO',
  'rondonia': 'RO',
  'tocantins': 'TO',
  'acre': 'AC',
  'amapá': 'AP',
  'amapa': 'AP',
  'amazonas': 'AM',
  'roraima': 'RR',
};

export const BRAZIL_STATE_NAMES = Object.keys(BRAZIL_STATES);

export function normalizeState(state: string): string {
  if (!state) return '';
  const lower = state.toLowerCase().trim();
  if (BRAZIL_STATES[lower]) return BRAZIL_STATES[lower];
  if (state.length === 2 && state === state.toUpperCase()) return state;
  return state;
}
