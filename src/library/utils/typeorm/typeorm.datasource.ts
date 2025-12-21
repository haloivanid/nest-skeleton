import { config } from 'dotenv';
config();

import { DataSource } from 'typeorm';
import { typeormConfig } from '@conf/typeorm';

export const dataSource = new DataSource(typeormConfig);
