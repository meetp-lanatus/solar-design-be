import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPgTrgmExtension1739777262412 implements MigrationInterface {
  name = 'AddPgTrgmExtension1739777262412'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // add trgm extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // remove trgm extension
    await queryRunner.query(`DROP EXTENSION IF EXISTS pg_trgm;`)
  }
}
