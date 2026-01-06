import { Logger } from '@nestjs/common';
import { envSchema, ValidatedEnv } from './env.schema';

export function validateEnv(config: Record<string, unknown>): ValidatedEnv {
  const logger = new Logger('EnvValidation');
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    logger.error('Invalid environment variables:');
    parsed.error.issues.forEach((error) => {
      const path = error.path.join('.');
      logger.error(`  • ${path}: ${error.message}`);
    });
    throw new Error('Environment validation failed. Please check the errors above.');
  }

  return parsed.data;
}
