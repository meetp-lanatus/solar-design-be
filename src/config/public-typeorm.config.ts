import { config } from 'dotenv'
import { DataSource, DataSourceOptions } from 'typeorm'

import 'reflect-metadata'

import { getBooleanFromValue } from './types'

config()

const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_PORT, DB_DATABASE, DB_SSL } =
  process.env

export const typeormPublicDataSource: DataSourceOptions = {
  type: 'postgres',
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  synchronize: false,
  ssl: getBooleanFromValue(DB_SSL)
    ? {
        rejectUnauthorized: false,
      }
    : false,
  logging: 'all',
  useUTC: true,
  entities: [__dirname + '/../modules/**/*.entity.{ts,js}'],
  migrations: [__dirname + '/../migrations/public/*.{ts,js}'],
  subscribers: [],
}

export const typeormPublicDataSourceInstance = new DataSource(
  typeormPublicDataSource as DataSourceOptions,
)
