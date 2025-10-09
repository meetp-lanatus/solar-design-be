import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiHeader,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import { UserTennatsGuard } from '@app/common/guards'

import { Action } from '@modules/casl/action.enum'
import { CheckPolicies } from '@modules/casl/check-policies.decorator'
import { PoliciesGuard } from '@modules/casl/policies.guard'
import { TENANT_HEADER } from '@modules/tenancy/tenancy.middleware'

import { CreateGridDto } from './dto/create-grid.dto'
import { UpdateGridDto } from './dto/update-grid.dto'
import { Grid } from './entities/grid.entity'
import { GridService } from './grid.service'

@Controller('sites/:siteId/grids')
@UseGuards(UserTennatsGuard)
@UseGuards(PoliciesGuard)
@ApiTags('Grids')
@ApiBearerAuth()
@ApiHeader({
  name: TENANT_HEADER,
  description: 'tenant header',
  required: true,
})
@ApiParam({
  name: 'siteId',
  required: true,
  type: String,
  description: 'Site ID',
})
export class GridController {
  constructor(private readonly gridService: GridService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, Grid))
  @ApiResponse({ status: 201, description: 'New Grid Created.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() createGridDto: CreateGridDto,
    @Param('siteId') siteId: string,
  ) {
    return this.gridService.create(siteId, createGridDto)
  }

  @Get()
  @CheckPolicies((ability) => ability.can(Action.ReadAll, Grid))
  @ApiResponse({ status: 200, description: 'All Grids' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Param('siteId') siteId: string) {
    return this.gridService.findAll(siteId)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gridService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('siteId') siteId: string,
    @Param('id') id: string,
    @Body() updateGridDto: UpdateGridDto,
  ) {
    return this.gridService.update(siteId, id, updateGridDto)
  }

  @Delete(':id')
  remove(@Param('siteId') siteId: string, @Param('id') id: string) {
    return this.gridService.remove(siteId, id)
  }
}
