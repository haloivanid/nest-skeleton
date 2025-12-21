import { config } from 'dotenv';
config();

import { DataSource } from 'typeorm';
import { join } from 'path';
import { typeormConfig } from '@conf/typeorm';

export const typeormMigrationsDataSource = new DataSource({
  ...typeormConfig,
  migrations: [join(__dirname, '../../../databases/migrations/*.{js,ts}')],
});
