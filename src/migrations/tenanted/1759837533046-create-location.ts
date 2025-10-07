import { MigrationInterface, QueryRunner } from 'typeorm'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'

export class CreateLocation1759837533046 implements MigrationInterface {
  name = 'CreateLocation1759837533046'
  publicSchema = 'public'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions

    await queryRunner.query(`
      CREATE TABLE "${schema}"."locations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "latitude" numeric(10,7) NOT NULL,
        "longitude" numeric(10,7) NOT NULL,
        "address1" varchar(255) NOT NULL,
        "address2" varchar(255) NOT NULL,
        "city" varchar(255) NOT NULL,
        "state" varchar(255) NOT NULL,
        "zipcode" varchar(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_locations_id" PRIMARY KEY ("id")
      );
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions

    await queryRunner.query(`DROP TABLE IF EXISTS "${schema}"."locations";`)
  }
}
