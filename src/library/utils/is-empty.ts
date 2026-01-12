/**
 * Checks if a value is empty.
 *
 * @param value - The value to check.
 * @returns True if the value is empty, false otherwise.
 */
export function isEmpty(value: any) {
  if (value == null) return true;

  if (
    Array.isArray(value) ||
    typeof value === 'string' ||
    (typeof value === 'object' && typeof value.length === 'number')
  ) {
    return value.length === 0;
  }

  if (value instanceof Map || value instanceof Set) {
    return value.size === 0;
  }

  if (typeof value === 'object') {
    for (const key in value) {
      if (Object.hasOwn(value, key)) return false;
    }
    return true;
  }

  return typeof value === 'string' && value === '';
}
