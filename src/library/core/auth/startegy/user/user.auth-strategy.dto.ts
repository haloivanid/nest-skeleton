import { z } from 'zod';

export const UserAuthStrategyDtoSchema = z
  .object({ id: z.uuidv7(), iat: z.number().min(0).optional(), exp: z.number().min(0).optional() })
  .strict();
export type UserAuthStrategyDto = z.infer<typeof UserAuthStrategyDtoSchema>;
