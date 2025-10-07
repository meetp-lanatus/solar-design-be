import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { DateEntity } from '../../../../common/entities/date.entity'

import { Grid } from './grid.entity'

@Entity({
  name: 'panels',
})
export class Panel extends DateEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'PK_panels_id',
  })
  id: string

  @Column({
    name: 'row_no',
    type: 'int',
  })
  row_no: number

  @Column({
    name: 'column_no',
    type: 'int',
  })
  column_no: number

  @Column({
    name: 'position',
    type: 'int',
  })
  position: number

  @ManyToOne(() => Grid, { nullable: false })
  @JoinColumn({ name: 'grid_id' })
  grid: Grid
}
