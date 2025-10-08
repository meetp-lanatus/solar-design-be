import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddCacheTable1741671455401 implements MigrationInterface {
  name = 'AddCacheTable1741671455401'
  publicSchema = 'public'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create unlogged cache table
    await queryRunner.query(
      `CREATE UNLOGGED TABLE "${this.publicSchema}"."cache" (
        "id" SERIAL NOT NULL,
        "key" text NOT NULL,
        "value" jsonb,
        "inserted_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_cache_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_cache_key" UNIQUE ("key")
      )`,
    )

    // Create index on cache key
    await queryRunner.query(
      `CREATE INDEX "IDX_cache_key" ON "${this.publicSchema}"."cache" ("key")`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop cache table and index
    await queryRunner.query(`DROP INDEX "${this.publicSchema}"."IDX_cache_key"`)
    await queryRunner.query(`DROP TABLE "${this.publicSchema}"."cache"`)
  }
}
