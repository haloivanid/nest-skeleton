type CommonValueObject = Primitive | Date | Record<string, any>;
export type ObjectPrimitive<T extends CommonValueObject> = { value: T };
export type ValueObjectField<T> = T extends Primitive | Date | ObjectPrimitive<CommonValueObject> ? T : never;
