import { DataSourceOptions } from 'typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';
import * as process from 'process';

dotenv.config();

const config: DataSourceOptions = {
  type: 'postgres',
  host: process.env.PG_HOST,
  username: process.env.PG_USER,
  password: process.env.PG_PASS,
  database: process.env.PG_DATABASE,
  ssl: true,
  entities: [join(__dirname, '**', '*.entity{.js,.ts}')],
  synchronize: false,
  migrations: [join(__dirname, 'migrations', '**', '*{.ts,.js}')],
};

export default config;
