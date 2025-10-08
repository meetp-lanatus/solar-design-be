import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'

import { PaginationQueries, ResponseMessage } from '@app/common/decorator'
import { UserTennatsGuard } from '@app/common/guards'
import {
  getFilterParams,
  getPaginationParam,
  getSortParams,
  IPaginationResult,
} from '@app/utils/query-param.util'

import { Action } from '@modules/casl/action.enum'
import { CheckPolicies } from '@modules/casl/check-policies.decorator'
import { PoliciesGuard } from '@modules/casl/policies.guard'
import { TENANT_HEADER } from '@modules/tenancy/tenancy.middleware'

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { RoleEnum } from './entities/role.entity'
import { User } from './entities/user.entity'
import { UserService } from './user.service'

@Controller({
  path: 'users',
})
@UseGuards(UserTennatsGuard)
@UseGuards(PoliciesGuard)
@ApiTags('Users')
@ApiBearerAuth()
@ApiHeader({
  name: TENANT_HEADER,
  description: 'tenant header',
  required: true,
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, User))
  @ResponseMessage('User created successfully.')
  @ApiResponse({ status: 201, description: 'New User Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createDto: CreateUserDto,
    @Req() request: Request,
  ): Promise<User> {
    return await this.userService.create(
      createDto,
      request?.user as User,
      request?.tenantId,
    )
  }

  @Get()
  @CheckPolicies((ability) => ability.can(Action.ReadAll, User))
  @ApiResponse({ status: 200, description: 'All Users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @PaginationQueries()
  async findAll(
    @Query() query: object,
    @Req() request: Request,
  ): Promise<IPaginationResult<User>> {
    const paginationParam = getPaginationParam(query)
    const sortParams = getSortParams(query)
    const filterParams = getFilterParams(query)

    const { users, totalCount } =
      await this.userService.filterNonSuperAdminUsersFindAll(
        paginationParam,
        sortParams,
        filterParams,
        request.tenantId,
        request.currentUserRoleName as RoleEnum,
        request.currentUserRelation,
      )

    return { records: users, totalCount }
  }

  @Get(':userId')
  @CheckPolicies((ability) => ability.can(Action.Read, User))
  @ApiResponse({ status: 200, description: 'User For Given ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async findOne(
    @Param('userId') userId: string,
    @Req() request: Request,
  ): Promise<User> {
    return await this.userService.validateUserAndFindOne(
      userId,
      request?.user as User,
      request?.tenantId,
    )
  }

  @Patch(':userId')
  @CheckPolicies((ability) => ability.can(Action.Update, User))
  @ApiResponse({ status: 200, description: 'Successful Update' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden Resource' })
  async update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: Request,
  ): Promise<User> {
    return await this.userService.update(
      userId,
      updateUserDto,
      request?.user as User,
      request.tenantId,
      request.currentUserRelation,
    )
  }

  @Delete(':userId')
  @CheckPolicies((ability) => ability.can(Action.Delete, User))
  @ApiResponse({ status: 200, description: 'Successful Delete' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden Resource' })
  async remove(
    @Param('userId') userId: string,
    @Req() request: Request,
  ): Promise<any> {
    return await this.userService.remove(
      userId,
      request?.user as User,
      request?.tenantId,
    )
  }
}
