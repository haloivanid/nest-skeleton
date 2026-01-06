import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

export function requestDtoValidator<T>(data: Record<string, any>, dtoSchema: z.ZodSchema<T>) {
  const result = dtoSchema.safeParse(data);
  if (!result.success) {
    throw new BadRequestException(result.error.message);
  }

  return result.data;
}
