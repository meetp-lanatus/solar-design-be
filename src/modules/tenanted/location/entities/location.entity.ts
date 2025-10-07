import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

import { DateEntity } from '../../../../common/entities/date.entity'

@Entity({
  name: 'location',
})
export class Location extends DateEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'PK_locations_id',
  })
  id: string

  @Column('decimal', {
    name: 'latitude',
    precision: 10,
    scale: 7,
  })
  lat: number

  @Column('decimal', {
    name: 'longitude',
    precision: 10,
    scale: 7,
  })
  long: number

  @Column({
    name: 'address1',
    type: 'varchar',
    length: 255,
  })
  address1: string

  @Column({
    name: 'address2',
    type: 'varchar',
    length: 255,
  })
  address2: string

  @Column({
    name: 'city',
    type: 'varchar',
    length: 255,
  })
  city: string

  @Column({
    name: 'state',
    type: 'varchar',
    length: 255,
  })
  state: string

  @Column({
    name: 'zipcode',
    type: 'varchar',
    length: 255,
  })
  zipcode: string
}
