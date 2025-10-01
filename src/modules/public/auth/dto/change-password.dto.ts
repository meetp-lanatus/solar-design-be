import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator'

import { NewPasswordDto } from './new-password.dto'

export class ChangePasswordDto extends NewPasswordDto {
  @ApiProperty({
    required: true,
    type: 'string',
    minLength: 5,
    maxLength: 72,
  })
  @MinLength(5)
  @MaxLength(72)
  @IsNotEmpty()
  currentPassword: string
}
