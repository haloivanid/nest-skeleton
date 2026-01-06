import { Entity, ValueObject } from '@libs/core/domain';

export function domainToPlainUtil(value: unknown) {
  if (Entity.asIs(value)) return value.toObject();
  if (ValueObject.asIs(value)) return value.unpack();
  return value;
}
