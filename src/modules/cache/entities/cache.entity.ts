import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm'

@Entity({ schema: 'public', name: 'cache' })
@Index('IDX_cache_key', ['key'])
@Unique('UQ_cache_key', ['key'])
export class Cache {
  @PrimaryGeneratedColumn({
    name: 'id',
    primaryKeyConstraintName: 'PK_cache_id',
    type: 'integer',
  })
  id: number

  @Column({ name: 'key', type: 'text', unique: true })
  key: string

  @Column({ name: 'value', type: 'jsonb', nullable: true })
  value: any

  @Column({
    name: 'inserted_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  insertedAt: Date
}
