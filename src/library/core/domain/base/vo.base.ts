import { ObjectPrimitive, ValueObjectField, ValueObjectFieldSchema } from '@libs/core/domain/types';
import { isEmpty } from '@libs/utils';

export abstract class ValueObject<T> {
  protected readonly field: ValueObjectField<T>;

  abstract getObjectFieldsSchema(): ValueObjectFieldSchema<ValueObjectField<T>>;

  constructor(value: ValueObjectField<T>) {
    if (isEmpty(value)) throw new Error('ValueObject is empty');
    this.field = this.prepareFields(value);
  }

  equals(value: ValueObject<T>) {
    if (value === null || value === undefined) return false;
    return JSON.stringify(this) === JSON.stringify(value);
  }

  unpack(): Readonly<Primitive | Date | T> {
    if (this.isObjectPrimitive(this.field)) return Object.freeze(this.field.value);
    return Object.freeze(this.field);
  }

  static asIs(value: unknown): value is ValueObject<unknown> {
    return value instanceof ValueObject;
  }

  private isObjectPrimitive<T extends Primitive | Date>(obj: unknown): obj is ObjectPrimitive<T> {
    return !!Object.hasOwn(obj as object, 'value');
  }

  private prepareFields(fields: unknown): ValueObjectField<T> {
    const schema = this.getObjectFieldsSchema();
    const result = schema.safeParse(fields);

    if (!result.success) {
      throw new Error(`Invalid object fields: ${result.error.message}`);
    }

    return result.data;
  }
}
