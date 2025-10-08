import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { DateEntity } from '../../../../common/entities/date.entity'
import { UserTenantRelation } from '../../user/entities/user-tenant-relation.entity'

@Entity({
  name: 'tenants',
  schema: 'public',
})
export class Tenant extends DateEntity {
  @PrimaryGeneratedColumn({
    name: 'id',
    primaryKeyConstraintName: 'PK_tenants_id',
    type: 'integer',
  })
  id: number

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string

  @OneToMany(
    () => UserTenantRelation,
    (userTenantRelation) => userTenantRelation.tenant,
  )
  userTenantRelation: UserTenantRelation[]
}
