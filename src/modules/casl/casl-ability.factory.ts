import { Injectable } from '@nestjs/common'
import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability'

import { Tenant } from '@modules/public/tenant/entities/tenant.entity'
import { Role, RoleEnum } from '@modules/public/user/entities/role.entity'
import { User } from '@modules/public/user/entities/user.entity'
import { UserTenantRelation } from '@modules/public/user/entities/user-tenant-relation.entity'
import { Location } from '@modules/tenanted/location/entities/location.entity'

import { Action } from './action.enum'

// Define Subjects Type
export type Subjects =
  | 'all'
  | InferSubjects<
      | typeof User
      | User
      | typeof Tenant
      | Tenant
      | typeof Role
      | Role
      | typeof UserTenantRelation
      | UserTenantRelation
      | typeof Location
      | Location
    >

export type AppAbility = Ability<[Action, Subjects]>

type FlatUserTenantRelation = UserTenantRelation & {
  'role.name': UserTenantRelation['role']['name']
  'tenant.id': UserTenantRelation['tenant']['id']
}

@Injectable()
export class CaslAbilityFactory {
  createForUser(currentUser: User, tenantId: string): AppAbility {
    const {
      can: allow,
      cannot: forbid,
      build,
    } = new AbilityBuilder<Ability<[Action, Subjects]>>(
      Ability as AbilityClass<AppAbility>,
    )

    const userTenantRelation = currentUser.userTenantRelation.filter(
      (relation) => relation.tenant.id === Number(tenantId),
    )[0]

    if (!userTenantRelation) {
      forbid(Action.Manage, 'all')
    }
    console.log(userTenantRelation)

    const userTenantRoleName = userTenantRelation.role.name

    if (userTenantRoleName.includes(RoleEnum.SUPER_ADMIN)) {
      console.log('call super admin', userTenantRoleName)

      allow(Action.Manage, 'all')
    }

    if (userTenantRoleName.includes(RoleEnum.ADMIN)) {
      allow<FlatUserTenantRelation>(Action.Create, UserTenantRelation, {
        'tenant.id': Number(tenantId),
        'role.name': { $in: [RoleEnum.CUSTOMER, RoleEnum.ADMIN] },
      })
      allow<FlatUserTenantRelation>(Action.Update, UserTenantRelation, {
        'tenant.id': Number(tenantId),
        'role.name': { $in: [RoleEnum.CUSTOMER, RoleEnum.ADMIN] },
      })

      allow(Action.Manage, User)

      allow(Action.Read, Tenant)
      allow(Action.Read, Role)
    }

    if (userTenantRoleName.includes(RoleEnum.CUSTOMER)) {
      allow(Action.Read, User, { userId: currentUser.userId })
      allow(Action.Update, User, { userId: currentUser.userId })

      allow(Action.Read, Tenant)
      forbid(Action.Manage, Role)

      forbid(Action.Manage, UserTenantRelation)
    }

    forbid(Action.Delete, User, { userId: currentUser.userId })

    return build({
      detectSubjectType: (subject) =>
        subject.constructor as ExtractSubjectType<Subjects>,
    })
  }
}
