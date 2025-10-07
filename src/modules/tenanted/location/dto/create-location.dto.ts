import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateLocationDto {
  @ApiProperty({
    required: true,
    type: 'number',
    description: 'Latitude coordinate',
    example: 40.7128,
  })
  @IsNumber()
  @IsNotEmpty()
  lat: number

  @ApiProperty({
    required: true,
    type: 'number',
    description: 'Longitude coordinate',
    example: -74.006,
  })
  @IsNumber()
  @IsNotEmpty()
  long: number

  @ApiProperty({
    required: true,
    type: 'string',
    description: 'Primary address line',
    example: '123 Main Street',
  })
  @IsString()
  @IsNotEmpty()
  address1: string

  @ApiProperty({
    required: true,
    type: 'string',
    description: 'Secondary address line',
    example: 'Apt 4B',
  })
  @IsString()
  @IsNotEmpty()
  address2: string

  @ApiProperty({
    required: true,
    type: 'string',
    description: 'City name',
    example: 'New York',
  })
  @IsString()
  @IsNotEmpty()
  city: string

  @ApiProperty({
    required: true,
    type: 'string',
    description: 'State or province',
    example: 'NY',
  })
  @IsString()
  @IsNotEmpty()
  state: string

  @ApiProperty({
    required: true,
    type: 'string',
    description: 'Postal code',
    example: '10001',
  })
  @IsString()
  @IsNotEmpty()
  zipcode: string
}
