import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsEmail()
  email: string

  @ApiProperty({
    type: 'string',
    required: true,
    minLength: 5,
    maxLength: 72,
  })
  @MinLength(5)
  @MaxLength(72)
  @IsNotEmpty()
  password: string
}
