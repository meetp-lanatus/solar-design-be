import { MigrationInterface, QueryRunner } from 'typeorm'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'

export class CreatPanel1759837576770 implements MigrationInterface {
  name = 'CreatPanel1759837576770'
  publicSchema = 'public'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions

    await queryRunner.query(`
      CREATE TABLE "${schema}"."panels" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "row_no" int NOT NULL,
        "column_no" int NOT NULL,
        "position" int NOT NULL,
        "grid_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_panels_id" PRIMARY KEY ("id"),
       CONSTRAINT "FK_panels_grid_id" FOREIGN KEY ("grid_id") REFERENCES "${schema}"."grids"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions

    await queryRunner.query(`DROP TABLE IF EXISTS "${schema}"."panels";`)
  }
}
