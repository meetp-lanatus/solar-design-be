import { MigrationInterface, QueryRunner } from 'typeorm'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'

export class UpdateGrid1759988555662 implements MigrationInterface {
  name = 'UpdateGrid1759988555662'
  publicSchema = 'public'
  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions

    await queryRunner.query(`
              ALTER TABLE "${schema}"."grids" ADD "latitude" numeric(10,7) NOT NULL;
              ALTER TABLE "${schema}"."grids" ADD "longitude" numeric(10,7) NOT NULL;
              ALTER TABLE "${schema}"."grids" ADD "rotate" numeric(10,7) NOT NULL;
              `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions
    await queryRunner.query(`
              ALTER TABLE "${schema}"."grids" DROP COLUMN "latitude";
              ALTER TABLE "${schema}"."grids" DROP COLUMN "longitude";
              `)
  }
}
