import { DataSource, DataSourceOptions } from 'typeorm'

import { typeormPublicDataSource } from './public-typeorm.config'

export const typeormTenantedDataSource: DataSourceOptions = {
  ...typeormPublicDataSource,
  migrations: [__dirname + '/../migrations/tenanted/*.{ts,js}'],
}

export const typeormTenantedDataSourceInstance = new DataSource(
  typeormTenantedDataSource as DataSourceOptions,
)
