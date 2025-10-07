import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { DateEntity } from '../../../../common/entities/date.entity'
import { User } from '../../../public/user/entities/user.entity'
import { Location } from '../../location/entities/location.entity'

export enum SiteTypeEnum {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
}

export enum EstimatePowerUnit {
  KWP = 'kWp',
  MWP = 'MWp',
  WP = 'Wp',
}

@Entity({
  name: 'sites',
})
export class Site extends DateEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'PK_sites_id',
  })
  id: string

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
  })
  name: string

  @Column({
    name: 'type',
    type: 'enum',
    enum: SiteTypeEnum,
    default: SiteTypeEnum.RESIDENTIAL,
  })
  type: SiteTypeEnum

  @Column({
    name: 'installation_date',
    type: 'date',
  })
  installationDate: Date

  @Column({
    name: 'estimated_peak_power_value',
    type: 'float',
  })
  estimatedPeakPowerValue: number

  @Column({
    name: 'estimated_peak_power_unit',
    type: 'enum',
    enum: EstimatePowerUnit,
    default: EstimatePowerUnit.KWP,
  })
  estimatedPeakPowerUnit: EstimatePowerUnit

  @Column({
    name: 'notes',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  notes: string

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User

  @ManyToOne(() => Location, { nullable: false })
  @JoinColumn({ name: 'location_id' })
  location: Location
}
