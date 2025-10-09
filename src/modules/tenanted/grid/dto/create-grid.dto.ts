import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsLatitude, IsNumber, IsString } from 'class-validator'

export class CreateGridDto {
  @ApiProperty({
    description: 'Latitude coordinate',
    example: 40.7128,
  })
  @IsLatitude()
  lat: number

  @ApiProperty({
    description: 'Longitude coordinate',
    example: -74.006,
  })
  @IsLatitude()
  long: number

  @ApiProperty({
    description: 'Rotate coordinate',
    example: 335.0973,
  })
  @IsNumber()
  rotate: number

  @ApiProperty({
    description: 'Height in millimeters',
    example: 1000,
  })
  @IsNumber()
  heightMm: number

  @ApiProperty({
    description: 'Width in millimeters',
    example: 500,
  })
  @IsNumber()
  widthMm: number

  @ApiProperty({
    description: 'Number of rows',
    example: 10,
  })
  @IsInt()
  rows: number

  @ApiProperty({
    description: 'Number of columns',
    example: 5,
  })
  @IsInt()
  columns: number

  @ApiProperty({
    description: 'Make/manufacturer of the grid',
    example: 'SolarTech',
  })
  @IsString()
  make: string

  @ApiProperty({
    description: 'Open-circuit voltage',
    example: 40.5,
  })
  @IsNumber()
  voc: number

  @ApiProperty({
    description: 'Voltage at maximum power',
    example: 33.2,
  })
  @IsNumber()
  vmp: number

  @ApiProperty({
    description: 'Short-circuit current',
    example: 9.5,
  })
  @IsNumber()
  isc: number

  @ApiProperty({
    description: 'Current at maximum power',
    example: 8.9,
  })
  @IsNumber()
  imp: number

  @ApiProperty({
    description: 'Maximum power',
    example: 295.48,
  })
  @IsNumber()
  pmax: number

  @ApiProperty({
    description: 'Module efficiency percentage',
    example: 18.5,
  })
  @IsNumber()
  moduleEfficiency: number
}
