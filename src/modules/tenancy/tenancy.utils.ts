import { DataSource, DataSourceOptions } from 'typeorm'

import { typeormTenantedDataSource } from '@app/config/tenanted-typeorm.config'

export const tenantConnections: { [schemaName: string]: DataSource } = {}

export async function getTenantConnection(
  tenantId: string,
): Promise<DataSource> {
  const connectionName = `tenant_${tenantId}`

  if (tenantConnections[connectionName]) {
    const connection = tenantConnections[connectionName]
    return connection
  } else {
    const dataSource = new DataSource({
      ...typeormTenantedDataSource,
      name: connectionName,
      schema: connectionName,
    } as DataSourceOptions)

    await dataSource.initialize()

    tenantConnections[connectionName] = dataSource

    return dataSource
  }
}
