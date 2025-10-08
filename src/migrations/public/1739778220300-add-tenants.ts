import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTenants1739778220300 implements MigrationInterface {
  name = 'AddTenants1739778220300'
  publicSchema = 'public'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // add tenants
    await queryRunner.query(`
      CREATE TABLE "${this.publicSchema}"."tenants" (
        "id" SERIAL NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tenants_id" PRIMARY KEY ("id")
      );
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // remove tenants
    await queryRunner.query(
      `DROP TABLE IF EXISTS "${this.publicSchema}"."tenants";`,
    )
  }
}
