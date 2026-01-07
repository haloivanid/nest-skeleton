import { isStringTruthy } from '@libs/utils';
import { z } from 'zod';

const createHexBufferSchema = (minBytes: number, fieldName: string) => {
  return z
    .string()
    .min(1, `${fieldName} is required`)
    .refine(
      (val) => {
        const isHex = /^[0-9a-fA-F]+$/.test(val);
        if (!isHex) return false;

        return val.length >= minBytes * 2;
      },
      { message: `${fieldName} must be at least ${minBytes} bytes (${minBytes * 2} hex characters)` },
    )
    .transform((val) => Buffer.from(val, 'hex'));
};

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .default('3000')
    .transform((val) => +(val || 3000))
    .pipe(z.number().int().positive().max(65535)),

  DB_HOST: z.string().min(1, 'DB_HOST is required'),
  DB_PORT: z
    .string()
    .default('5432')
    .transform((val) => +(val || 5432))
    .pipe(z.number().int().positive().max(65535)),
  DB_USERNAME: z.string().min(1, 'DB_USERNAME is required'),
  DB_PASSWORD: z.string().min(1, 'DB_PASSWORD is required'),
  DB_NAME: z.string().min(1, 'DB_NAME is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters for security'),
  MASTER_KEY: createHexBufferSchema(16, 'MASTER_KEY'),
  DERIVE_KEY: createHexBufferSchema(1, 'DERIVE_KEY'),
  PII_SECRET: createHexBufferSchema(8, 'PII_SECRET'),
  HMAC_SECRET: createHexBufferSchema(8, 'HMAC_SECRET'),

  SALT_ROUND: z
    .string()
    .default('10')
    .transform((val) => +(val || 10))
    .pipe(z.number().int().min(10, 'SALT_ROUND must be >= 10 for security')),
  PII_ACTIVE: z
    .string()
    .default('2')
    .transform((val) => +(val || 2))
    .pipe(z.number().int().min(1).max(255, 'PII_ACTIVE must be between 1 and 255')),

  DEBUG: z
    .string()
    .optional()
    .default('false')
    .transform((val) => isStringTruthy(val)),
});

export type EnvSchema = z.infer<typeof envSchema>;

export type ValidatedEnv = {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  JWT_SECRET: string;
  MASTER_KEY: Buffer;
  DERIVE_KEY: Buffer;
  PII_SECRET: Buffer;
  HMAC_SECRET: Buffer;
  SALT_ROUND: number;
  PII_ACTIVE: number;
  DEBUG: boolean;
};
