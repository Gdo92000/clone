const STATE_NAME_TO_CODE: Record<string, string> = {
  acre: 'AC',
  alagoas: 'AL',
  amapa: 'AP',
  amazonas: 'AM',
  bahia: 'BA',
  ceara: 'CE',
  'distrito federal': 'DF',
  'espirito santo': 'ES',
  goias: 'GO',
  maranhao: 'MA',
  'mato grosso': 'MT',
  'mato grosso do sul': 'MS',
  'minas gerais': 'MG',
  para: 'PA',
  paraiba: 'PB',
  parana: 'PR',
  pernambuco: 'PE',
  piaui: 'PI',
  'rio de janeiro': 'RJ',
  'rio grande do norte': 'RN',
  'rio grande do sul': 'RS',
  rondonia: 'RO',
  roraima: 'RR',
  'santa catarina': 'SC',
  'sao paulo': 'SP',
  sergipe: 'SE',
  tocantins: 'TO',
};

const VALID_UF_CODES = new Set<string>(Object.values(STATE_NAME_TO_CODE));

function stripAccents(input: string): string {
  return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeStateBR(rawState: string | null | undefined): string {
  if (typeof rawState !== 'string') return '';
  const trimmed = rawState.trim();
  if (trimmed === '') return '';

  const upper = trimmed.toUpperCase();

  if (VALID_UF_CODES.has(upper)) return upper;

  const normalized = stripAccents(trimmed.toLowerCase());
  const fromName = STATE_NAME_TO_CODE[normalized];
  if (fromName) return fromName;

  if (normalized.length >= 2) {
    const firstTwo = normalized.substring(0, 2).toUpperCase();
    if (VALID_UF_CODES.has(firstTwo)) return firstTwo;
  }

  return upper;
}
