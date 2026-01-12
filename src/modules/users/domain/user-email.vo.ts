import { ValueObject } from '@libs/core/domain';
import { ValueObjectField, ValueObjectFieldSchema } from '@libs/core/domain/types';
import z from 'zod';

export class UserEmailValueObject extends ValueObject<string> {
  getObjectFieldsSchema(): ValueObjectFieldSchema<ValueObjectField<string>> {
    return z.email();
  }

  static create(obj: string) {
    obj = obj.trim().toLowerCase();
    return new UserEmailValueObject(obj);
  }
}
