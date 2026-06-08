import { describe, it, expect } from 'vitest';
import { coerceNumeric, coerceNumericOrZero, coerceNumericOrUndefined } from './format';

describe('coerceNumeric', () => {
  it('converte string numérica para number', () => {
    expect(coerceNumeric('5.00')).toBe(5);
    expect(coerceNumeric('0')).toBe(0);
    expect(coerceNumeric('-20.5386')).toBe(-20.5386);
    expect(coerceNumeric('  42.5  ')).toBe(42.5);
  });

  it('preserva number quando já é number', () => {
    expect(coerceNumeric(5)).toBe(5);
    expect(coerceNumeric(0)).toBe(0);
    expect(coerceNumeric(-20.5386)).toBe(-20.5386);
  });

  it('retorna null para null e undefined', () => {
    expect(coerceNumeric(null)).toBeNull();
    expect(coerceNumeric(undefined)).toBeNull();
  });

  it('retorna null para string vazia', () => {
    expect(coerceNumeric('')).toBeNull();
    expect(coerceNumeric('   ')).toBeNull();
  });

  it('retorna null para valores não-numéricos', () => {
    expect(coerceNumeric('abc')).toBeNull();
    expect(coerceNumeric({})).toBeNull();
    expect(coerceNumeric([])).toBeNull();
    expect(coerceNumeric(true)).toBeNull();
  });

  it('retorna null para NaN e Infinity', () => {
    expect(coerceNumeric(NaN)).toBeNull();
    expect(coerceNumeric(Infinity)).toBeNull();
    expect(coerceNumeric(-Infinity)).toBeNull();
  });
});

describe('coerceNumericOrZero', () => {
  it('retorna number válido', () => {
    expect(coerceNumericOrZero('5.00')).toBe(5);
    expect(coerceNumericOrZero(0)).toBe(0);
  });

  it('retorna 0 para null/undefined/inválido', () => {
    expect(coerceNumericOrZero(null)).toBe(0);
    expect(coerceNumericOrZero(undefined)).toBe(0);
    expect(coerceNumericOrZero('')).toBe(0);
    expect(coerceNumericOrZero('abc')).toBe(0);
  });
});

describe('coerceNumericOrUndefined', () => {
  it('retorna number válido', () => {
    expect(coerceNumericOrUndefined('5.00')).toBe(5);
  });

  it('retorna undefined para null/inválido', () => {
    expect(coerceNumericOrUndefined(null)).toBeUndefined();
    expect(coerceNumericOrUndefined(undefined)).toBeUndefined();
    expect(coerceNumericOrUndefined('')).toBeUndefined();
  });
});
