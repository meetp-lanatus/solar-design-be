import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Cache } from './entities/cache.entity'

@Injectable()
export class CacheService {
  constructor(
    @InjectRepository(Cache)
    private readonly cacheRepository: Repository<Cache>,
  ) {}

  async create(key: string, value: any): Promise<Cache> {
    const cacheEntry = this.cacheRepository.create({ key, value })
    return await this.cacheRepository.save(cacheEntry)
  }

  async findByKey(key: string): Promise<Cache | null> {
    return await this.cacheRepository.findOne({ where: { key } })
  }

  async deleteByKey(key: string): Promise<void> {
    await this.cacheRepository.delete({ key })
  }
}
