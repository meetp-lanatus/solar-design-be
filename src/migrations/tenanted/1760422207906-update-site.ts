import { MigrationInterface, QueryRunner } from 'typeorm'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'

export class UpdateSite1760422207906 implements MigrationInterface {
  name = 'UpdateSite1760422207906'
  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions

    await queryRunner.query(`
        ALTER TABLE "${schema}"."sites"
        ADD COLUMN "rotate" NUMERIC(10,7) NOT NULL DEFAULT 0;
`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions

    await queryRunner.query(`
        ALTER TABLE "${schema}"."sites"
        DROP COLUMN "rotate";
    `)
  }
}
