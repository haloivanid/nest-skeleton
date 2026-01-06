import { domainToPlainUtil } from '@libs/core/domain';

export function fieldToPlainUtil<T extends object>(field: T): Record<keyof T, unknown> {
  const newObj = {} as Record<keyof T, unknown>;
  for (const k of Object.keys(field)) {
    const value = field[k];
    if (Array.isArray(value)) {
      newObj[k] = value.map(domainToPlainUtil);
    } else {
      newObj[k] = domainToPlainUtil(value);
    }
  }

  return newObj;
}
