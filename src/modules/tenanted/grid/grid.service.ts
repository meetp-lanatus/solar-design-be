import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'

import { CONNECTION } from '@modules/tenancy/tenancy.symbols'

import { Site } from '../site/entities/site.entity'

import { CreateGridDto } from './dto/create-grid.dto'
import { UpdateGridDto } from './dto/update-grid.dto'
import { Grid } from './entities/grid.entity'
import { Panel } from './entities/panel.entity'
import {
  calculateCenterFromEdges,
  calculateOffsetsFromCenters,
} from './utils/calculation.util'

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
  private async recomputeChildren(parent: Grid): Promise<void> {
    const children = await this.gridRepository.find({
      where: { parentGrid: { id: parent.id } },
    })
    for (const child of children) {
      // Calculate new position based on current offset values
      const { lat, lng } = calculateCenterFromEdges(
        Number(parent.lat),
        Number(parent.long),
        Number(parent.rotate),
        Number(parent.widthMm),
        Number(parent.heightMm),
        Number(child.widthMm),
        Number(child.heightMm),
        Number(child.offsetX),
        Number(child.offsetY),
      )

      // Update child position
      child.lat = lat
      child.long = lng

      // IMPORTANT: Recalculate offset values based on new parent position
      const { offsetX, offsetY } = calculateOffsetsFromCenters(
        Number(parent.lat),
        Number(parent.long),
        Number(parent.rotate),
        Number(parent.widthMm),
        Number(parent.heightMm),
        Number(child.lat),
        Number(child.long),
        Number(child.widthMm),
        Number(child.heightMm),
      )

      // Update child with new offset values
      child.offsetX = offsetX
      child.offsetY = offsetY

      await this.gridRepository.save(child)
      await this.recomputeChildren(child)
    }
  }
  async create(siteId: string, createGridDto: CreateGridDto) {
    const site = await this.siteRepository.findOne({
      where: { id: siteId },
    })
    if (!site) {
      throw new NotFoundException('Site not found')
    }

    const isRelativeGrid = !!createGridDto.parentGridId

    if (isRelativeGrid) {
      const parentGridId = createGridDto.parentGridId
      const parentGrid = await this.gridRepository.findOne({
        where: { id: parentGridId },
      })

      if (!parentGrid) {
        throw new NotFoundException('Parent grid not found')
      }
      const { lat, lng } = calculateCenterFromEdges(
        Number(parentGrid.lat),
        Number(parentGrid.long),
        Number(parentGrid.rotate),
        Number(parentGrid.widthMm),
        Number(parentGrid.heightMm),
        Number(createGridDto.widthMm),
        Number(createGridDto.heightMm),
        Number(createGridDto.offsetX),
        Number(createGridDto.offsetY),
      )

      const grid = this.gridRepository.create({
        ...createGridDto,
        site: site,
        rotate: parentGrid.rotate,
        parentGrid: parentGrid,
        lat,
        long: lng,
      })
      const newGrid = await this.gridRepository.save(grid)
      const panels = []

      for (let r = 1; r <= createGridDto.rows; r++) {
        for (let c = 1; c <= createGridDto.columns; c++) {
          panels.push({
            rowNo: r,
            columnNo: c,
            grid: newGrid,
          })
        }
      }
      const savedPanels = await this.panelRepository.save(panels)
      return {
        ...newGrid,
        panels: savedPanels,
      }
    } else {
      const grid = this.gridRepository.create({
        ...createGridDto,
        site: site,
      })
      const newGrid = await this.gridRepository.save(grid)
      const panels = []

      for (let r = 1; r <= createGridDto.rows; r++) {
        for (let c = 1; c <= createGridDto.columns; c++) {
          panels.push({
            rowNo: r,
            columnNo: c,
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
  }

  async findAll(siteId: string) {
    if (!siteId) {
      throw new NotFoundException('Site not found')
    }
    const grids = await this.gridRepository.find({
      where: { site: { id: siteId } },
      loadRelationIds: {
        relations: ['parentGrid'],
      },
      order: {
        createdAt: 'ASC',
      },
    })

    return grids
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
      relations: ['parentGrid'],
    })

    if (!grid) {
      throw new NotFoundException('Grid not found')
    }

    const needsRelativeRecalc =
      typeof updateGridDto.parentGridId !== 'undefined' ||
      typeof updateGridDto.offsetX !== 'undefined' ||
      typeof updateGridDto.offsetY !== 'undefined' ||
      typeof updateGridDto.widthMm !== 'undefined' ||
      typeof updateGridDto.heightMm !== 'undefined' ||
      typeof updateGridDto.rotate !== 'undefined' ||
      typeof updateGridDto.lat !== 'undefined' ||
      typeof updateGridDto.long !== 'undefined'

    const hasLatLngUpdate =
      typeof updateGridDto.lat !== 'undefined' ||
      typeof updateGridDto.long !== 'undefined'

    // If this grid has a parent and is being moved, recalculate offsets
    if (hasLatLngUpdate && grid.parentGrid) {
      const parentGrid = await this.gridRepository.findOne({
        where: { id: String(grid.parentGrid.id) },
      })
      if (!parentGrid) {
        throw new NotFoundException('Parent grid not found')
      }

      const childLat =
        updateGridDto.lat !== undefined ? updateGridDto.lat : grid.lat
      const childLng =
        updateGridDto.long !== undefined ? updateGridDto.long : grid.long
      const childWidthMm =
        updateGridDto.widthMm !== undefined
          ? updateGridDto.widthMm
          : grid.widthMm
      const childHeightMm =
        updateGridDto.heightMm !== undefined
          ? updateGridDto.heightMm
          : grid.heightMm

      // Recalculate offset values based on new position
      const { offsetX, offsetY } = calculateOffsetsFromCenters(
        Number(parentGrid.lat),
        Number(parentGrid.long),
        Number(parentGrid.rotate),
        Number(parentGrid.widthMm),
        Number(parentGrid.heightMm),
        Number(childLat),
        Number(childLng),
        Number(childWidthMm),
        Number(childHeightMm),
      )

      // Update the grid with new position and recalculated offsets
      Object.assign(grid, updateGridDto, { offsetX, offsetY })
    } else if (
      needsRelativeRecalc &&
      (updateGridDto.parentGridId || grid.parentGrid)
    ) {
      const parentId = updateGridDto.parentGridId || grid.parentGrid?.id
      const parentGrid = await this.gridRepository.findOne({
        where: { id: String(parentId) },
      })
      if (!parentGrid) {
        throw new NotFoundException('Parent grid not found')
      }

      if (hasLatLngUpdate) {
        const childLat =
          updateGridDto.lat !== undefined ? updateGridDto.lat : grid.lat
        const childLng =
          updateGridDto.long !== undefined ? updateGridDto.long : grid.long
        const childWidthMm =
          updateGridDto.widthMm !== undefined
            ? updateGridDto.widthMm
            : grid.widthMm
        const childHeightMm =
          updateGridDto.heightMm !== undefined
            ? updateGridDto.heightMm
            : grid.heightMm

        const { offsetX, offsetY } = calculateOffsetsFromCenters(
          Number(parentGrid.lat),
          Number(parentGrid.long),
          Number(parentGrid.rotate),
          Number(parentGrid.widthMm),
          Number(parentGrid.heightMm),
          Number(childLat),
          Number(childLng),
          Number(childWidthMm),
          Number(childHeightMm),
        )
        Object.assign(grid, updateGridDto, { offsetX, offsetY, parentGrid })
      } else {
        const childWidthMm =
          updateGridDto.widthMm !== undefined
            ? updateGridDto.widthMm
            : grid.widthMm
        const childHeightMm =
          updateGridDto.heightMm !== undefined
            ? updateGridDto.heightMm
            : grid.heightMm
        const offsetX =
          updateGridDto.offsetX !== undefined
            ? updateGridDto.offsetX
            : grid.offsetX
        const offsetY =
          updateGridDto.offsetY !== undefined
            ? updateGridDto.offsetY
            : grid.offsetY

        const { lat, lng } = calculateCenterFromEdges(
          Number(parentGrid.lat),
          Number(parentGrid.long),
          Number(parentGrid.rotate),
          Number(parentGrid.widthMm),
          Number(parentGrid.heightMm),
          Number(childWidthMm),
          Number(childHeightMm),
          Number(offsetX),
          Number(offsetY),
        )
        Object.assign(grid, updateGridDto, { lat, long: lng, parentGrid })
      }
    } else {
      Object.assign(grid, updateGridDto)
    }

    const saved = await this.gridRepository.save(grid)

    // Only recompute children if this grid has children and was moved
    if (needsRelativeRecalc && hasLatLngUpdate) {
      await this.recomputeChildren(saved)
    }

    return saved
  }

  async remove(siteId: string, id: string) {
    const grid = await this.gridRepository.findOne({
      where: { id, site: { id: siteId } },
    })

    if (!grid) {
      throw new NotFoundException('Grid not found')
    }

    // Find all children that have this grid as parent
    await this.gridRepository.update(
      { parentGrid: { id: id } },
      { parentGrid: null, offsetX: 0, offsetY: 0 },
    )

    // Delete the grid and its panels
    await this.gridRepository.remove(grid)

    return { message: 'Grid and associated panels deleted successfully' }
  }
}
