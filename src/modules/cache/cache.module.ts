import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Cache } from './entities/cache.entity'
import { CacheService } from './cache.service'

@Module({
  imports: [TypeOrmModule.forFeature([Cache])],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
