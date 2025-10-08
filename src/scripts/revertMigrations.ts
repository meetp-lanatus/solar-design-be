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
  revertLastMigration(publicDatasourceInstance)
} else if (type === 'tenanted') {
  revertTenantedMigrations()
} else {
  console.log('Please choose either public or tenanted')
  process.exit(1)
}

async function revertLastMigration(dataSource: DataSource) {
  try {
    await dataSource.initialize()

    // Get all migrations
    const migrations = await dataSource.query(
      'SELECT * FROM migrations ORDER BY "timestamp" DESC',
    )

    if (migrations.length === 0) {
      console.log('No migrations to revert')
      return
    }

    // Revert only the last migration
    await dataSource.undoLastMigration()
    console.log('Last migration reverted successfully')
  } catch (error) {
    console.error('Error reverting migration', error)
  } finally {
    await dataSource.destroy()
  }
}

async function revertTenantedMigrations() {
  try {
    const tenantSchemaNames = await getTenantSchemaNames()

    for (const tenantSchemaName of tenantSchemaNames) {
      console.log(`Reverting last migration for schema: ${tenantSchemaName}`)
      const tenantDataSource = new DataSource({
        ...typeormTenantedDataSource,
        schema: tenantSchemaName,
      } as DataSourceOptions)

      await revertLastMigration(tenantDataSource)
    }
  } catch (error) {
    console.error('Error reverting tenanted migrations', error)
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
