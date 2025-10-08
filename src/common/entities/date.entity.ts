import { Exclude } from 'class-transformer'
import { CreateDateColumn, UpdateDateColumn } from 'typeorm'

export class DateEntity {
  @CreateDateColumn({ name: 'created_at' })
  @Exclude()
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  @Exclude()
  updatedAt: Date
}
