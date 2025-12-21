import { config } from 'dotenv';
config();

import { DataSource } from 'typeorm';
import { join } from 'path';
import { typeormConfig } from '@conf/typeorm';

export const typeormSeedDataSource = new DataSource({
  ...typeormConfig,
  migrations: [join(__dirname, '../../../databases/seeds/*.{js,ts}')],
});
