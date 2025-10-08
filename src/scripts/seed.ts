import { DataSource, DataSourceOptions } from 'typeorm'

import { typeormPublicDataSource } from '@app/config/public-typeorm.config'

import { Tenant } from '@modules/public/tenant/entities/tenant.entity'
import { Role, RoleEnum } from '@modules/public/user/entities/role.entity'
import { User } from '@modules/public/user/entities/user.entity'
import { UserTenantRelation } from '@modules/public/user/entities/user-tenant-relation.entity'

/**
 * enter your email for testing in local
 */
const superAdminEmail = 'admin@lanatussystems.com'

const publicDataSource = new DataSource(
  typeormPublicDataSource as DataSourceOptions,
)

async function seedAdmin() {
  try {
    const roleRepository = publicDataSource.getRepository(Role)
    const userRepository = publicDataSource.getRepository(User)
    const userTenantRelationRepository =
      publicDataSource.getRepository(UserTenantRelation)
    const tenantRepository = publicDataSource.getRepository(Tenant)

    const defaultTenant = await tenantRepository.save(
      tenantRepository.create({
        name: 'Default_tenant',
      }),
    )

    const schemaName = `tenant_${defaultTenant.id}`
    await publicDataSource.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`)

    const superAdminRole = await roleRepository.findOne({
      where: {
        name: RoleEnum.SUPER_ADMIN,
      },
    })

    const superAdminUser = userRepository.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: superAdminEmail,
      password: 'admin@123',
    })

    const superUser = await userRepository.save(superAdminUser)

    const relation = userTenantRelationRepository.create({
      role: superAdminRole,
      user: superUser,
      tenant: defaultTenant,
    })
    const addedRelation = await userTenantRelationRepository.save(relation)
  } catch (error) {
    console.log(error)
  }
}

async function main() {
  await publicDataSource.initialize()
  await seedAdmin()
  publicDataSource.destroy()
}

main()
