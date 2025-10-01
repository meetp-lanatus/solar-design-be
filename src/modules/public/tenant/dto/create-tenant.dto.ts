import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreateTenantDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  name: string
}
