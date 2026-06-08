export function coerceNumeric(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function coerceNumericOrZero(value: unknown): number {
  return coerceNumeric(value) ?? 0;
}

export function coerceNumericOrUndefined(value: unknown): number | undefined {
  return coerceNumeric(value) ?? undefined;
}
