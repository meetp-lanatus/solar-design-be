import { ApiProperty } from '@nestjs/swagger'
import { IsEmail } from 'class-validator'

export class ForgotPasswordDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsEmail()
  email: string
}
