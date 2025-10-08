import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'

import { RoleEnum } from '@modules/public/user/entities/role.entity'
import { User } from '@modules/public/user/entities/user.entity'

@Injectable()
export class UserTennatsGuard implements CanActivate {
  /**
   * Guards that does this user have access to given tenantId
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest()
    const currentUser = request.user as User
    const tenantId = Number(request.tenantId)

    const userTenantIds = currentUser.userTenantRelation.map(
      (relation) => relation.tenant.id,
    )

    if (userTenantIds.includes(tenantId)) {
      const currentUserRelation = currentUser.userTenantRelation.filter(
        (relation) => relation.tenant.id === tenantId,
      )[0]

      request.currentUserRelation = {
        relationId: currentUserRelation.id,
        roleName: currentUserRelation.role.name as RoleEnum,
        roleId: currentUserRelation.role.id,
        tenantId: currentUserRelation.tenant.id,
        tenantName: currentUserRelation.tenant.name,
        userId: currentUser.userId,
      }

      request.currentUserRoleName = currentUserRelation.role.name as RoleEnum

      return true
    }

    return false
  }
}
