interface ICurrentUserRelation {
  userId: string
  relationId: number
  tenantId: number
  tenantName: string
  roleId: number
  roleName: string
}

declare namespace Express {
  interface Request {
    tenantId?: string
    currentUserRoleName?: string
    currentUserRelation?: ICurrentUserRelation
  }
}
