import { ApiProperty } from '@nestjs/swagger'
import {
  IsDateString,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'

import { EstimatePowerUnit, SiteTypeEnum } from '../entities/site.entity'

export class CreateSiteDto {
  @ApiProperty({ description: 'Latitude coordinate', example: 40.7128 })
  @IsLatitude()
  lat: number

  @ApiProperty({ description: 'Longitude coordinate', example: -74.006 })
  @IsLongitude()
  long: number

  @ApiProperty({ description: 'Rotate coordinate', example: 335.0973 })
  @IsOptional()
  @IsNumber()
  rotate?: number

  @ApiProperty({ description: 'Primary address', example: '123 Main Street' })
  @IsString()
  address1: string

  @ApiProperty({
    description: 'Secondary address',
    example: 'Apt 4B',
    required: false,
  })
  @IsOptional()
  @IsString()
  address2?: string

  @ApiProperty({ description: 'City', example: 'New York' })
  @IsString()
  city: string

  @ApiProperty({ description: 'State', example: 'NY' })
  @IsString()
  state: string

  @ApiProperty({ description: 'PIN code', example: '10001' })
  @IsString()
  pinCode: string

  @ApiProperty({ description: 'Site name', example: 'My Solar Site' })
  @IsString()
  name: string

  @ApiProperty({
    description: 'Site type',
    enum: SiteTypeEnum,
    example: SiteTypeEnum.RESIDENTIAL,
  })
  @IsEnum(SiteTypeEnum)
  type: SiteTypeEnum

  @ApiProperty({ description: 'Installation date', example: '2024-01-15' })
  @IsDateString()
  installationDate: string

  @ApiProperty({ description: 'Estimated peak power value', example: 5.5 })
  @IsNumber()
  @Min(0)
  estimatedPeakPowerValue: number

  @ApiProperty({
    description: 'Estimated peak power unit',
    enum: EstimatePowerUnit,
    example: EstimatePowerUnit.KWP,
  })
  @IsEnum(EstimatePowerUnit)
  estimatedPeakPowerUnit: EstimatePowerUnit

  @ApiProperty({
    description: 'Additional notes',
    example: 'South-facing roof',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string

  @ApiProperty({
    description: 'Customer ID to create site for',
    example: 'edda87e4-af4b-46ee-94b0-c739e2601e3f',
    required: true,
  })
  @IsOptional()
  @IsString()
  customerId: string
}
