/**
 * Fixture serializer — normaliza entidades para JSON seguro.
 *
 * Problemas resolvidos:
 *  - `Date` → ISO string
 *  - propriedades `undefined` → omite (não serializáveis em JSON)
 *  - funções / símbolos → omitidas
 *  - valores NaN / Infinity → string descritiva
 */

/** Substitui valores não-JSON-safe por representação segura. */
function safeValue(v: unknown): unknown {
  if (typeof v === 'function' || typeof v === 'symbol') return undefined;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'bigint') return v.toString();
  if (typeof v === 'number') {
    if (Number.isNaN(v)) return '__NaN__';
    if (!Number.isFinite(v)) return v > 0 ? '__Infinity__' : '__-Infinity__';
  }
  return v;
}

/**
 * deepStripFunctions — percorre objeto recursivamente filtrando valores não-serializáveis.
 * Protege contra referências circulares com WeakSet.
 */
function deepStripFunctions(value: unknown, visited?: WeakSet<object>): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'function' || typeof value === 'symbol') return undefined;
  if (Array.isArray(value)) return value.map((v) => deepStripFunctions(v, visited));
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'object') {
    const set = visited ?? new WeakSet();
    if (set.has(value as object)) return undefined;
    set.add(value as object);
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const safeV = safeValue(v);
      if (safeV !== undefined) result[k] = deepStripFunctions(safeV, set);
    }
    return result;
  }
  return value;
}

/**
 * serializeEntity — tipa entidade como Record<string, unknown>
 * para garantir compatibilidade com qualquer store memória.
 */
export function serializeEntity(entity: Record<string, unknown>): Record<string, unknown> {
  return deepStripFunctions(entity) as Record<string, unknown>;
}

/**
 * serializeEntities — serializa array de entidades.
 */
export function serializeEntities(
  entities: Record<string, unknown>[],
): Record<string, unknown>[] {
  return entities.map(serializeEntity);
}

/**
 * assertSerializable — valida que o objeto é JSON-serializável antes de escrever fixture.
 * Primeiro aplica deep strip (funções, símbolos, datas) e depois valida.
 * Útil como assert de contrato antes de gravar arquivos.
 */
export function assertSerializable(value: unknown): void {
  const stripped = deepStripFunctions(value);
  try {
    JSON.stringify(stripped);
  } catch (e) {
    throw new Error(
      `Entidade não é serializável: ${e instanceof Error ? e.message : 'erro desconhecido'}`,
    );
  }
}
