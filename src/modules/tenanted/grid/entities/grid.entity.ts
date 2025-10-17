import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { DateEntity } from '../../../../common/entities/date.entity'
import { Site } from '../../site/entities/site.entity'

import { Panel } from './panel.entity'

@Entity({
  name: 'grids',
})
export class Grid extends DateEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'PK_grids_id',
  })
  id: string

  @Column({
    type: 'decimal',
    name: 'latitude',
    precision: 10,
    scale: 7,
  })
  lat: number

  @Column({
    type: 'decimal',
    name: 'longitude',
    precision: 10,
    scale: 7,
  })
  long: number

  @Column({
    type: 'decimal',
    name: 'rotate',
    precision: 10,
    scale: 7,
  })
  rotate: number

  @Column({
    type: 'decimal',
    name: 'offset_x',
    precision: 10,
    scale: 7,
  })
  offsetX: number

  @Column({
    type: 'decimal',
    name: 'offset_y',
    precision: 10,
    scale: 7,
  })
  offsetY: number

  @ManyToOne(() => Grid, (grid) => grid.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_grid_id' })
  parentGrid: Grid

  @OneToMany(() => Grid, (grid) => grid.parentGrid)
  children: Grid[]

  @Column({
    name: 'height_mm',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  heightMm: number

  @Column({
    name: 'width_mm',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  widthMm: number

  @Column({
    name: 'rows',
    type: 'int',
  })
  rows: number

  @Column({
    name: 'columns',
    type: 'int',
  })
  columns: number

  @Column({
    name: 'make',
    type: 'varchar',
    length: 255,
  })
  make: string

  @Column({
    name: 'voc',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  voc: number

  @Column({
    name: 'vmp',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  vmp: number

  @Column({
    name: 'isc',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  isc: number

  @Column({
    name: 'imp',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  imp: number

  @Column({
    name: 'pmax',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  pmax: number

  @Column({
    name: 'module_efficiency',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  moduleEfficiency: number

  @ManyToOne(() => Site, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'site_id' })
  site: Site

  @OneToMany(() => Panel, (panel) => panel.grid)
  panels: Panel[]
}
