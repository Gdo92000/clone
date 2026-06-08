/**
 * Fixture Tests — valida serializer, shots e loader.
 */
import { describe, it, expect } from 'vitest';
import { serializeEntity, serializeEntities, assertSerializable } from '../../db/fixtures/serializer';

// ─── serializer tests ──────────────────────────────────────────────────────────

describe('Serializer', () => {
  describe('serializeEntity', () => {
    it('retém chaves e valores normais', () => {
      const fixture = serializeEntity({ id: '1', name: 'São Paulo', state: 'SP' });
      expect(fixture).toEqual({ id: '1', name: 'São Paulo', state: 'SP' });
    });

    it('converte Date → ISO string', () => {
      const now = new Date('2025-01-01T00:00:00.000Z');
      const fixture = serializeEntity({ id: '1', created_at: now });
      expect(fixture.created_at).toBe('2025-01-01T00:00:00.000Z');
    });

    it('remove propriedades com valor undefined', () => {
      const fixture = serializeEntity({ id: '1', name: undefined, label: 'ok' });
      expect(fixture).not.toHaveProperty('name');
      expect(fixture).toHaveProperty('label');
    });

    it('remove propriedades com valor null', () => {
      const fixture = serializeEntity({ id: '1', description: null, name: 'ok' });
      expect(fixture.description).toBeNull();
      expect(fixture).toHaveProperty('description');
    });

    it('remove propriedades de função', () => {
      const fixture = serializeEntity({ id: '1', click: () => {}, name: 'ok' });
      expect(fixture).not.toHaveProperty('click');
      expect(fixture).toHaveProperty('name');
    });

    it('remove símbolos', () => {
      const sym = Symbol('secret');
      const fixture = serializeEntity({ id: '1', [sym]: 42, name: 'ok' });
      const ownSymbols = Object.getOwnPropertySymbols(fixture);
      expect(ownSymbols).not.toContain(sym);
    });

    it('converte BigInt → string', () => {
      const fixture = serializeEntity({ id: 1n, name: 'ok' });
      expect(fixture.id).toBe('1');
    });

    it('converte NaN → "__NaN__"', () => {
      const fixture = serializeEntity({ id: '1', value: Number('NaN') });
      expect((fixture).value).toBe('__NaN__');
    });

    it('converte Infinity → "__Infinity__"', () => {
      const fixture = serializeEntity({ id: '1', value: Infinity });
      expect((fixture).value).toBe('__Infinity__');
    });

    it('serializa arrays de objetos', () => {
      const input = [
        { id: '1', name: 'A' },
        { id: '2', name: 'B' },
      ];
      const result = serializeEntities(input);
      expect(result).toEqual([
        { id: '1', name: 'A' },
        { id: '2', name: 'B' },
      ]);
    });
  });

  describe('assertSerializable', () => {
    it('não lança para objeto limpo', () => {
      expect(() => { assertSerializable({ id: '1', name: 'ok' }); }).not.toThrow();
    });

  it('sanitiza referência circular sem StackOverflow', () => {
    const obj = { id: '1', selfRef: 'going-back', self: null as unknown as Record<string, unknown> };
    Object.assign(obj, { self: obj });
    const result = serializeEntity(obj);
    expect(result).not.toEqual(obj);
    expect(result.selfRef).toBe('going-back');
  });
  });
});
