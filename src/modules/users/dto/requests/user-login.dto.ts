import { z } from 'zod';

export const UserLoginDtoSchema = z.object({ email: z.email(), password: z.string().min(6) });
export type UserLoginDto = z.infer<typeof UserLoginDtoSchema>;
