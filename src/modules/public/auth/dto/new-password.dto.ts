import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator'

import { SameAs } from '@app/common/validator'

export class NewPasswordDto {
  @ApiProperty({
    required: true,
    type: 'string',
    minLength: 5,
    maxLength: 72,
  })
  @MinLength(5)
  @MaxLength(72)
  @IsNotEmpty()
  newPassword: string

  @ApiProperty({ required: true, type: 'string' })
  @SameAs('newPassword')
  newPasswordConfirmation: string
}
