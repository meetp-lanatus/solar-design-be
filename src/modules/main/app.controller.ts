import { Controller, Get, HttpStatus } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { NoAuth } from '@app/common/decorator'

@Controller()
@NoAuth()
@ApiTags('Health Check')
export class AppController {
  constructor() {}

  @Get()
  root() {
    return HttpStatus.OK
  }
}
