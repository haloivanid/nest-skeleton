import { DataSourceOptions } from 'typeorm';
import { join } from 'node:path';
import { TypeormNamingStrategy } from '../../library/utils/typeorm/typeorm-naming-strategy';
import { envSchema } from '../env/env.schema';

export function createTypeOrmConfig(env: Record<string, unknown>): DataSourceOptions {
  const config = envSchema.parse(env);

  return {
    type: 'postgres',
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    entities: [join(__dirname, '../../databases/entities/**/*.typeorm-entity.{js,ts}')],
    synchronize: false,
    logging: config.DEBUG,
    namingStrategy: new TypeormNamingStrategy(),
  };
}

export const typeormConfig = (() => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error('TypeORM configuration failed. Please fix the environment variables above.');
  }

  return createTypeOrmConfig(process.env);
})();
