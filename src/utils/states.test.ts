import { describe, it, expect } from 'vitest';
import { normalizeStateBR } from './states';

describe('normalizeStateBR', () => {
  describe('códigos UF já válidos', () => {
    it.each([
      ['SP', 'SP'],
      ['RJ', 'RJ'],
      ['MG', 'MG'],
      ['BA', 'BA'],
      ['AC', 'AC'],
      ['DF', 'DF'],
    ])('retorna %s quando já é código UF válido', (input, expected) => {
      expect(normalizeStateBR(input)).toBe(expected);
    });

    it('preserva lowercase válido (ex: "sp")', () => {
      expect(normalizeStateBR('sp')).toBe('SP');
      expect(normalizeStateBR('rj')).toBe('RJ');
    });

    it('preserva com espaços nas pontas (trim)', () => {
      expect(normalizeStateBR('  SP  ')).toBe('SP');
      expect(normalizeStateBR(' MG ')).toBe('MG');
    });
  });

  describe('nomes completos', () => {
    it.each([
      ['São Paulo', 'SP'],
      ['Sao Paulo', 'SP'],
      ['Minas Gerais', 'MG'],
      ['Rio de Janeiro', 'RJ'],
      ['Rio Grande do Norte', 'RN'],
      ['Rio Grande do Sul', 'RS'],
      ['Mato Grosso', 'MT'],
      ['Mato Grosso do Sul', 'MS'],
      ['Santa Catarina', 'SC'],
      ['Espírito Santo', 'ES'],
      ['Espirito Santo', 'ES'],
      ['Distrito Federal', 'DF'],
      ['Amapá', 'AP'],
      ['Amapa', 'AP'],
      ['Paraná', 'PR'],
      ['Parana', 'PR'],
    ])('mapeia %s → %s', (input, expected) => {
      expect(normalizeStateBR(input)).toBe(expected);
    });

    it('é case-insensitive', () => {
      expect(normalizeStateBR('são paulo')).toBe('SP');
      expect(normalizeStateBR('MINAS GERAIS')).toBe('MG');
      expect(normalizeStateBR('Rio de janeiro')).toBe('RJ');
    });
  });

  describe('entradas inválidas', () => {
    it('retorna string vazia para null', () => {
      expect(normalizeStateBR(null)).toBe('');
    });

    it('retorna string vazia para undefined', () => {
      expect(normalizeStateBR(undefined)).toBe('');
    });

    it('retorna string vazia para string vazia', () => {
      expect(normalizeStateBR('')).toBe('');
      expect(normalizeStateBR('   ')).toBe('');
    });

    it('retorna uppercase quando não consegue mapear', () => {
      expect(normalizeStateBR('XX')).toBe('XX');
      expect(normalizeStateBR('Desconhecido')).toBe('DESCONHECIDO');
    });
  });

  describe('caso de uso real — Nominatim → Franca/SP', () => {
    it('Nominatim retorna "São Paulo" → normaliza para "SP"', () => {
      expect(normalizeStateBR('São Paulo')).toBe('SP');
    });

    it('ipapi.co retorna "São Paulo" → normaliza para "SP"', () => {
      expect(normalizeStateBR('São Paulo')).toBe('SP');
    });

    it('ip-api.com retorna "SP" → mantém "SP"', () => {
      expect(normalizeStateBR('SP')).toBe('SP');
    });
  });
});
