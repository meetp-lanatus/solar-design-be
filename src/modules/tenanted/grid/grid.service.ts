import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'

import { CONNECTION } from '@modules/tenancy/tenancy.symbols'

import { Site } from '../site/entities/site.entity'

import { CreateGridDto } from './dto/create-grid.dto'
import { UpdateGridDto } from './dto/update-grid.dto'
import { Grid } from './entities/grid.entity'
import { Panel } from './entities/panel.entity'

@Injectable()
export class GridService {
  private gridRepository: Repository<Grid>
  private siteRepository: Repository<Site>
  private panelRepository: Repository<Panel>
  constructor(@Inject(CONNECTION) private connection: DataSource) {
    this.gridRepository = this.connection.getRepository(Grid)
    this.siteRepository = this.connection.getRepository(Site)
    this.panelRepository = this.connection.getRepository(Panel)
  }
  async create(siteId: string, createGridDto: CreateGridDto) {
    const site = await this.siteRepository.findOne({
      where: { id: siteId },
    })
    if (!site) {
      throw new NotFoundException('Site not found')
    }
    const grid = this.gridRepository.create({
      ...createGridDto,
      site: site,
    })
    const newGrid = await this.gridRepository.save(grid)
    const panels = []
    let position = 1
    for (let r = 1; r <= createGridDto.rows; r++) {
      for (let c = 1; c <= createGridDto.columns; c++) {
        panels.push({
          rowNo: r,
          columnNo: c,
          position: position++,
          grid: newGrid,
        })
      }
    }
    const savedPanels = await this.panelRepository.save(panels)
    return {
      ...newGrid,
      panels: savedPanels,
    }
  }

  async findAll(siteId: string) {
    if (!siteId) {
      throw new NotFoundException('Site not found')
    }
    const grids = await this.gridRepository.find({
      where: { site: { id: siteId } },
    })

    return grids
  }

  findOne(id: string) {
    return `This action returns a #${id} grid`
  }

  async update(siteId: string, id: string, updateGridDto: UpdateGridDto) {
    const site = await this.siteRepository.findOne({
      where: { id: siteId },
    })
    if (!site) {
      throw new NotFoundException('Site not found')
    }
    const grid = await this.gridRepository.findOne({
      where: { id, site: { id: siteId } },
    })

    if (!grid) {
      throw new NotFoundException('Grid not found')
    }

    Object.assign(grid, updateGridDto)
    return await this.gridRepository.save(grid)
  }

  async remove(siteId: string, id: string) {
    const grid = await this.gridRepository.findOne({
      where: { id, site: { id: siteId } },
    })

    if (!grid) {
      throw new NotFoundException('Grid not found')
    }

    await this.gridRepository.remove(grid)
    return { message: 'Grid and associated panels deleted successfully' }
  }
}
