/**
 * Parse a user-typed decimal that may use a comma as decimal separator.
 * iOS decimal-pad shows a comma in most European locales; parseFloat("8,2")
 * silently returns 8, corrupting the value. Use this at every TextInput →
 * number boundary instead of parseFloat.
 */
export function parseLocaleFloat(input: string): number {
  if (typeof input !== 'string') return NaN;
  const normalized = input.trim().replace(/\s+/g, '').replace(',', '.');
  if (normalized === '') return NaN;
  return parseFloat(normalized);
}
