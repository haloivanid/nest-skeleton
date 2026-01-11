/**
 * Checks if a value is considered "truthy" based on common boolean string representations.
 * @param value - The value to check. Can be string, number, boolean, null, or undefined.
 * @returns {boolean} True if the value is considered truthy, false otherwise.
 *
 * Truthy values are:
 * - The boolean `true`
 * - The string "true", "yes", "y", or "ok" (case insensitive)
 * - Any number greater than 0
 * - The string representation of a number greater than 0
 */
export function isStringTruthy(value?: string): boolean {
  if (!value) return false;

  const strValue = String(value).toLowerCase().trim();

  const num = Number(strValue);
  if (!Number.isNaN(num)) return num > 0;

  return ['y', 'yes', 'true', 'ok'].includes(strValue);
}

export function toTitleCase(str: string): string {
  return str.trim().replaceAll(/\b\w/g, (match) => match.toUpperCase());
}
