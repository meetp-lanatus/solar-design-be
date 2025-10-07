import { MigrationInterface, QueryRunner } from 'typeorm'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'

export class CreatGrid1759837570535 implements MigrationInterface {
  name = 'CreatGrid1759837570535'
  publicSchema = 'public'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions

    await queryRunner.query(`
      CREATE TABLE "${schema}"."grids" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "height_mm" numeric(10,2) NOT NULL,
        "width_mm" numeric(10,2) NOT NULL,
        "rows" int NOT NULL,
        "columns" int NOT NULL,
        "make" varchar(255) NOT NULL,
        "voc" numeric(10,2) NOT NULL,
        "vmp" numeric(10,2) NOT NULL,
        "isc" numeric(10,2) NOT NULL,
        "imp" numeric(10,2) NOT NULL,
        "pmax" numeric(10,2) NOT NULL,
        "module_efficiency" numeric(5,2) NOT NULL,
        "site_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_grids_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_grids_site_id" FOREIGN KEY ("site_id") REFERENCES "${schema}"."sites"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      );
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions

    await queryRunner.query(`DROP TABLE IF EXISTS "${schema}"."grids";`)
  }
}
