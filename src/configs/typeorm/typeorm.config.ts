import { DataSourceOptions } from 'typeorm';
import { join } from 'path';
import { TypeormNamingStrategy } from '../../library/utils/typeorm/typeorm-naming-strategy';
import { isStringTruthy } from '@libs/utils';

export const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: +(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME || 'username',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'database',
  entities: [join(__dirname, '../../databases/entities/**/*.typeorm-entity.{js,ts}')],
  synchronize: false,
  logging: isStringTruthy(process.env.DEBUG),
  namingStrategy: new TypeormNamingStrategy(),
};
