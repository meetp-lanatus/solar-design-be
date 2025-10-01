import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'

import { VERSION_1 } from '@app/constants'

import { Action } from '@modules/casl/action.enum'
import { CheckPolicies } from '@modules/casl/check-policies.decorator'
import { PoliciesGuard } from '@modules/casl/policies.guard'

import { CreateTenantDto } from './dto/create-tenant.dto'
import { Tenant } from './entities/tenant.entity'
import { TenantService } from './tenant.service'

@Controller({
  path: 'tenants',
  version: VERSION_1,
})
// @UseGuards(PoliciesGuard)
@ApiTags('Tenants')
@ApiBearerAuth()
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  // @Post()
  // @CheckPolicies((ability) => ability.can(Action.Create, Tenant))
  // @ApiResponse({ status: 201, description: 'New Tenant Created' })
  // @ApiResponse({ status: 400, description: 'Bad Request' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // create(@Body() createTenantDto: CreateTenantDto): Promise<Tenant> {
  //   return this.tenantService.createTenant(createTenantDto)
  // }

  // @Get()
  // findAll(): Promise<Tenant[]> {
  //   return this.tenantService.findAll();
  // }
}
