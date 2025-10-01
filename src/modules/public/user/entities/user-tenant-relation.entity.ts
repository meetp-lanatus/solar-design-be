import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'

import { DateEntity } from '../../../../common/entities/date.entity'
import { Tenant } from '../../../../modules/public/tenant/entities/tenant.entity'

import { Role } from './role.entity'
import { User } from './user.entity'

@Entity({
  name: 'user_tenant_relation',
  schema: 'public',
})
@Unique('UQ_user_tenant_relation_user_tenant', ['user', 'tenant']) // Unique constraint
export class UserTenantRelation extends DateEntity {
  @PrimaryGeneratedColumn({
    name: 'id',
    primaryKeyConstraintName: 'PK_user_tenant_relation_id',
    type: 'integer',
  })
  id: number

  @ManyToOne(() => User, (user) => user.userTenantRelation)
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_user_tenant_relation_user_id',
  })
  user: User

  @ManyToOne(() => Tenant, (tenant) => tenant.userTenantRelation, {
    eager: true,
  })
  @JoinColumn({
    name: 'tenant_id',
    foreignKeyConstraintName: 'FK_user_tenant_relation_tenant_id',
  })
  tenant: Tenant

  @ManyToOne(() => Role, (role) => role.userTenantRelation, { eager: true })
  @JoinColumn({
    name: 'role_id',
    foreignKeyConstraintName: 'FK_user_tenant_relation_role_id',
  })
  role: Role
}
