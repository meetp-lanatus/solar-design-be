import { MigrationInterface, QueryRunner } from 'typeorm'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'

export class UpdateGrid1759988555662 implements MigrationInterface {
  name = 'UpdateGrid1759988555662'
  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions

    await queryRunner.query(`
      ALTER TABLE "${schema}"."grids"
      ADD "latitude" numeric(10,7) NOT NULL;
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."grids"
      ADD "longitude" numeric(10,7) NOT NULL;
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."grids"
      ADD "rotate" numeric(10,7) NOT NULL;
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."grids"
      ADD "offset_x" numeric DEFAULT 0;
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."grids"
      ADD "offset_y" numeric DEFAULT 0;
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."grids"
      ADD "parent_grid_id" uuid;
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."grids"
      ADD CONSTRAINT "FK_grids_parent_grid_id"
      FOREIGN KEY ("parent_grid_id") REFERENCES "${schema}"."grids"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION;
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions

    await queryRunner.query(`
      ALTER TABLE "${schema}"."grids"
      DROP CONSTRAINT "FK_grids_parent_grid_id";
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."grids"
      DROP COLUMN "parent_grid_id";
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."grids"
      DROP COLUMN "offset_y";
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."grids"
      DROP COLUMN "offset_x";
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."grids"
      DROP COLUMN "rotate";
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."grids"
      DROP COLUMN "longitude";
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."grids"
      DROP COLUMN "latitude";
    `)
  }
}
