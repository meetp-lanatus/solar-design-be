import { DataSource, DataSourceOptions } from 'typeorm'

import { typeormPublicDataSource } from '../config/public-typeorm.config'
import { typeormTenantedDataSource } from '../config/tenanted-typeorm.config'
import { Tenant } from '../modules/public/tenant/entities/tenant.entity'

if (process.argv.length < 3) {
  console.log('Please choose either public or tenanted')
  process.exit(1)
}

const environment = process.argv[2]
const type = process.argv[3]

if (['dev', 'development'].includes(environment)) {
  process.env.NODE_ENV = 'development'
} else if (['test', 'testing'].includes(environment)) {
  process.env.NODE_ENV = 'test'
} else if (['prod', 'production'].includes(environment)) {
  process.env.NODE_ENV = 'production'
} else {
  console.log(
    'Please choose either dev/development, test/testing, or prod/production',
  )
  process.exit(1)
}

const publicDatasourceInstance = new DataSource(
  typeormPublicDataSource as DataSourceOptions,
)

if (type === 'public') {
  runMigrations(publicDatasourceInstance)
} else if (type === 'tenanted') {
  runTenantedMigrations()
} else {
  console.log('Please choose either public or tenanted')
  process.exit(1)
}

async function runMigrations(dataSource: DataSource) {
  try {
    await dataSource.initialize()
    await dataSource.runMigrations()
    console.log('Migrations applied successfully')
  } catch (error) {
    console.error('Error running migrations', error)
  } finally {
    await dataSource.destroy()
  }
}

async function runTenantedMigrations() {
  // Fetch tenant schemas dynamically from the tenants table
  const tenantSchemaNames = await getTenantSchemaNames()

  for (const tenantSchemaName of tenantSchemaNames) {
    console.log(`Running migrations for schema: ${tenantSchemaName}`)
    const tenantDataSource = new DataSource({
      ...typeormTenantedDataSource,
      schema: tenantSchemaName,
    } as DataSourceOptions)

    await runMigrations(tenantDataSource)
  }
}

async function getTenantSchemaNames(): Promise<string[]> {
  try {
    await publicDatasourceInstance.initialize()
    const tenantRepository = publicDatasourceInstance.getRepository(Tenant)
    const tenants = await tenantRepository.find()
    const tenantSchemaNames = tenants.map((data) => `tenant_${data.id}`)
    return tenantSchemaNames
  } catch (error) {
    console.error('Error fetching tenant schemas', error)
    throw error
  } finally {
    await publicDatasourceInstance.destroy()
  }
}
