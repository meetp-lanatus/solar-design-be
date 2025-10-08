import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger'

import { PaginationQueries } from '@app/common/decorator'
import { UserTennatsGuard } from '@app/common/guards'

import { Action } from '@modules/casl/action.enum'
import { CheckPolicies } from '@modules/casl/check-policies.decorator'
import { PoliciesGuard } from '@modules/casl/policies.guard'
import { User } from '@modules/public/user/entities/user.entity'
import { TENANT_HEADER } from '@modules/tenancy/tenancy.middleware'

import { CreateSiteDto } from './dto/create-site.dto'
import { UpdateSiteDto } from './dto/update-site.dto'
import { Site } from './entities/site.entity'
import { SiteService } from './site.service'

@Controller('sites')
@UseGuards(UserTennatsGuard)
@UseGuards(PoliciesGuard)
@ApiTags('sites')
@ApiBearerAuth()
@ApiHeader({
  name: TENANT_HEADER,
  description: 'tenant header',
  required: true,
})
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, Site))
  @ApiResponse({ status: 201, description: 'New Site Created.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createSiteDto: CreateSiteDto, @Request() req: any) {
    return this.siteService.create(
      createSiteDto,
      req.user as User,
      req.tenantId,
    )
  }

  @Get()
  @CheckPolicies((ability) => ability.can(Action.ReadAll, Site))
  @ApiResponse({ status: 200, description: 'All Sites' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @PaginationQueries()
  findAll(@Request() req: any) {
    return this.siteService.findAll(req.user as User, req.tenantId)
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can(Action.Read, Site))
  @ApiResponse({ status: 200, description: 'Site For Given ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.siteService.findOne(id, req.user as User)
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can(Action.Update, Site))
  @ApiResponse({ status: 200, description: 'Successful Update' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden Resource' })
  update(
    @Param('id') id: string,
    @Body() updateSiteDto: UpdateSiteDto,
    @Request() req: any,
  ) {
    return this.siteService.update(
      id,
      updateSiteDto,
      req.user as User,
      req.tenantId,
    )
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can(Action.Delete, Site))
  @ApiResponse({ status: 200, description: 'Successful Delete' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden Resource' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.siteService.remove(id, req.user as User)
  }
}
