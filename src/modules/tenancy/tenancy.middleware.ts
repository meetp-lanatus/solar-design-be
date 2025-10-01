import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

import { TenantService } from '@modules/public/tenant/tenant.service'

export const TENANT_HEADER = 'x-tenant-id'

@Injectable()
export class TenancyMiddleware implements NestMiddleware {
  /**
   * Check is tenantId is valid or not
   */
  constructor(private readonly tenantService: TenantService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId: string = req.headers[TENANT_HEADER] as string
    if (!tenantId) {
      return res.status(400).send('Tenant ID is missing.')
    }
    // validate tenantId
    const isTenantExists = await this.tenantService.validateTenantId(tenantId)

    if (!isTenantExists) {
      return res.status(400).send('Tenant not found.')
    }

    req.tenantId = tenantId
    next()
  }
}
