import { PartialType } from '@nestjs/swagger'

import { CreateGridDto } from './create-grid.dto'

export class UpdateGridDto extends PartialType(CreateGridDto) {}
