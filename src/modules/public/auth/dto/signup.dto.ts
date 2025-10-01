import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator'

import { SameAs } from '@app/common/validator'

import { BaseUser } from '@modules/public/user/dto/base-user.dto'

export class SignupDto extends BaseUser {
  @ApiProperty({
    required: true,
    type: 'string',
    minLength: 5,
    maxLength: 72,
  })
  @MinLength(5)
  @MaxLength(72)
  @IsNotEmpty()
  password: string

  @ApiProperty({ required: true, type: 'string' })
  @SameAs('password')
  passwordConfirmation: string

  @ApiProperty({ required: true, type: 'integer' })
  tenantId: number
}
