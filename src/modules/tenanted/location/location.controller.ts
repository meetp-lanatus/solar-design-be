import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger'

import { UserTennatsGuard } from '@app/common/guards'

import { Action } from '@modules/casl/action.enum'
import { CheckPolicies } from '@modules/casl/check-policies.decorator'
import { PoliciesGuard } from '@modules/casl/policies.guard'
import { TENANT_HEADER } from '@modules/tenancy/tenancy.middleware'

import { CreateLocationDto } from './dto/create-location.dto'
import { UpdateLocationDto } from './dto/update-location.dto'
import { Location } from './entities/location.entity'
import { LocationService } from './location.service'

@Controller('locations')
@UseGuards(UserTennatsGuard)
@UseGuards(PoliciesGuard)
@ApiTags('locations')
@ApiBearerAuth()
@ApiHeader({
  name: TENANT_HEADER,
  description: 'tenant header',
  required: true,
})
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, Location))
  @ApiResponse({
    status: 201,
    description: 'Location created successfully',
    type: Location,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createLocationDto: CreateLocationDto,
  ): Promise<Location> {
    return await this.locationService.create(createLocationDto)
  }

  @Get()
  @CheckPolicies((ability) => ability.can(Action.ReadAll, Location))
  @ApiResponse({ status: 200, description: 'All Products' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(): Promise<Location[]> {
    return await this.locationService.findAll()
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can(Action.Read, Location))
  @ApiResponse({ status: 200, description: 'Product For Given ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async findOne(@Param('id') id: string): Promise<Location> {
    return await this.locationService.findOne(id)
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can(Action.Update, Location))
  @ApiResponse({ status: 200, description: 'Successful Update' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden Resource' })
  async update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    return await this.locationService.update(id, updateLocationDto)
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can(Action.Delete, Location))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 200, description: 'Successful Delete' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden Resource' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.locationService.remove(id)
  }
}
