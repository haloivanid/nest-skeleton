import { TypeAdapter } from '@libs/utils/deep-converter';

export function hideStringTypeAdapter<From, To>(hiddenFields: (keyof To)[]): TypeAdapter<From, To> {
  return {
    match: (value: unknown, ctx) => typeof value === 'string' && hiddenFields.includes(ctx.key as keyof To),
    convert: (_value: unknown, _ctx) => '***',
  };
}

export function hideNumberTypeAdapter<From, To>(hiddenFields: (keyof To)[]): TypeAdapter<From, To> {
  return {
    match: (value: unknown, ctx) => typeof value === 'number' && hiddenFields.includes(ctx.key as keyof To),
    convert: (_value: unknown, _ctx) => NaN,
  };
}

export function hideObjectTypeAdapter<From, To>(hiddenFields: (keyof To)[]): TypeAdapter<From, To> {
  return {
    match: (value: unknown, ctx) =>
      typeof value === 'object' && !Array.isArray(value) && hiddenFields.includes(ctx.key as keyof To),
    convert: (_value: unknown, _ctx) => ({}) as To,
  };
}

export function hideArrayTypeAdapter<From, To>(hiddenFields: (keyof To)[]): TypeAdapter<From, To> {
  return {
    match: (value: unknown, ctx) =>
      typeof value === 'object' && Array.isArray(value) && hiddenFields.includes(ctx.key as keyof To),
    convert: (_value: unknown, _ctx) => [] as To,
  };
}
