import { Exclude } from 'class-transformer'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { DateEntity } from '../../../../common/entities/date.entity'

import { UserTenantRelation } from './user-tenant-relation.entity'

// We treat roles as schema
export enum RoleEnum {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  USER = 'user',
}

@Entity({
  name: 'roles',
  schema: 'public',
})
export class Role extends DateEntity {
  @PrimaryGeneratedColumn({
    name: 'id',
    primaryKeyConstraintName: 'PK_roles_id',
    type: 'integer',
  })
  @Exclude()
  id: number

  @Column({ name: 'name', type: 'varchar', length: 50 })
  name: string

  @OneToMany(
    () => UserTenantRelation,
    (userTenantRelation) => userTenantRelation.role,
  )
  userTenantRelation: UserTenantRelation[]
}
