import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNumber } from 'class-validator'

import { RoleEnum } from '@modules/public/user/entities/role.entity'

import { BaseUser } from './base-user.dto'

export class CreateUserDto extends BaseUser {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsEnum(RoleEnum)
  roleName: RoleEnum

  @ApiProperty({
    type: 'integer',
    required: true,
  })
  @IsNumber()
  tenantId: number
}
