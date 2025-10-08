import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString } from 'class-validator'

import { NewPasswordDto } from './new-password.dto'

export class ResetPasswordDto extends NewPasswordDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsEmail()
  email: string

  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString()
  token: string
}
