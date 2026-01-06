import { z } from 'zod';

export const CreateUserDtoSchema = z
  .object({
    name: z.string(),
    email: z.email(),
    password: z.string().superRefine((val, ctx) => {
      if (val.length < 8) ctx.addIssue({ code: 'custom', message: 'Min length 8.' });
      if (!/[A-Z]/.test(val)) ctx.addIssue({ code: 'custom', message: 'Min 1 uppercase.' });
      if (!/[a-z]/.test(val)) ctx.addIssue({ code: 'custom', message: 'Min 1 lowercase.' });
      if (!/\d/.test(val)) ctx.addIssue({ code: 'custom', message: 'Min 1 number.' });
      if (!/[^A-Za-z0-9]/.test(val)) ctx.addIssue({ code: 'custom', message: 'Min 1 special char.' });
      if (!/^\S*$/.test(val)) ctx.addIssue({ code: 'custom', message: 'Password must not contain spaces.' });
    }),
  })
  .strict();

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;
