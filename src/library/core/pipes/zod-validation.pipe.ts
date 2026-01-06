import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { z } from 'zod';

type ZodValidationPipeOptions = {
  /**
   * If true, validate only for these metatypes:
   * - body: metatype === Object
   * - query/param: metatype === Object
   * In most cases you can ignore this and validate always.
   */
  validateOnlyObjects?: boolean;

  /**
   * Customize error response payload shape.
   */
  errorFactory?: (error: z.ZodError) => unknown;
};

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(
    private readonly schema: z.ZodSchema,
    private readonly options: ZodValidationPipeOptions = {},
  ) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    const { validateOnlyObjects, errorFactory } = this.options;

    if (validateOnlyObjects) {
      // Common guard: skip primitives unless you explicitly model them
      const isObjectLike = value !== null && (typeof value === 'object' || typeof value === 'string');
      if (!isObjectLike) return value;
    }

    const result = this.schema.safeParse(value);

    if (!result.success) {
      const payload =
        errorFactory?.(result.error) ??
        ({
          message: 'Validation failed',
          issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message, code: i.code })),
        } as const);

      throw new BadRequestException(payload);
    }

    return result.data;
  }
}
