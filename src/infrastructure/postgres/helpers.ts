export function toDbInput(data: object): Record<string, unknown> {
  return { ...data };
}

export function fromDbRow(row: Record<string, unknown>): object {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    result[camelKey] = row[key];
  }
  return result;
}

export function fromDbRows<T>(rows: Record<string, unknown>[]): T[] {
  return rows.map((r) => fromDbRow(r)) as T[];
}
