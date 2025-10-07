import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { DateEntity } from '../../../../common/entities/date.entity'

import { Site } from './site.entity'

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
    name: 'height_mm',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  height_mm: number

  @Column({
    name: 'width_mm',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  width_mm: number

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
  module_efficiency: number

  @ManyToOne(() => Site, { nullable: false })
  @JoinColumn({ name: 'site_id' })
  site: Site
}
