import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { InjectRepository } from '@nestjs/typeorm'
import { Request } from 'express'
import { Repository } from 'typeorm'

import { CreateLocationDto } from './dto/create-location.dto'
import { UpdateLocationDto } from './dto/update-location.dto'
import { Location } from './entities/location.entity'

@Injectable({ scope: Scope.REQUEST })
export class LocationService {
  private tenantId: string
  constructor(
    @InjectRepository(Location)
    @Inject(REQUEST)
    private readonly request: Request,
    private readonly locationRepository: Repository<Location>,
  ) {
    this.tenantId = request.tenantId
  }

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    const location = this.locationRepository.create(createLocationDto)
    return await this.locationRepository.save(location)
  }

  async findAll(): Promise<Location[]> {
    return await this.locationRepository.find()
  }

  async findOne(id: string): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { id },
    })

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`)
    }

    return location
  }

  async update(
    id: string,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    const location = await this.findOne(id)

    Object.assign(location, updateLocationDto)
    return await this.locationRepository.save(location)
  }

  async remove(id: string): Promise<void> {
    const location = await this.findOne(id)
    await this.locationRepository.remove(location)
  }
}
