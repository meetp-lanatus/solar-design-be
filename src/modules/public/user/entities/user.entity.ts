import { Exclude } from 'class-transformer'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { DateEntity } from '../../../../common/entities/date.entity'
import { PasswordTransformer } from '../../../../common/transformer'

import { UserTenantRelation } from './user-tenant-relation.entity'

@Entity({
  name: 'users',
  schema: 'public',
})
export class User extends DateEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'user_id',
    primaryKeyConstraintName: 'PK_users_user_id',
  })
  userId: string

  @Column({ name: 'first_name', type: 'varchar', length: 255, nullable: true })
  firstName: string

  @Column({ name: 'last_name', type: 'varchar', length: 255, nullable: true })
  lastName: string

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  email: string

  @Column({
    name: 'password',
    type: 'varchar',
    length: 255,
    nullable: true,
    transformer: new PasswordTransformer(),
  })
  @Exclude()
  password: string

  @Column({
    name: 'refresh_token',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  @Exclude()
  refreshToken: string

  @OneToMany(
    () => UserTenantRelation,
    (userTenantRelation) => userTenantRelation.user,
    {
      eager: true,
    },
  )
  userTenantRelation: UserTenantRelation[]
}
