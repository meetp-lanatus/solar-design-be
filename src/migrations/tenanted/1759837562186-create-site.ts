import { MigrationInterface, QueryRunner } from 'typeorm'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'

export class CreateSite1759837562186 implements MigrationInterface {
  name = 'CreateSite1759837562186'
  publicSchema = 'public'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions

    await queryRunner.query(`
      CREATE TABLE "${schema}"."sites" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "type" varchar NOT NULL DEFAULT 'residential',
        "installation_date" date NOT NULL,
        "estimated_peak_power_value" float NOT NULL,
        "estimated_peak_power_unit" varchar NOT NULL DEFAULT 'kWp',
        "notes" varchar(255),
        "user_id" uuid NOT NULL,
        "location_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sites_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sites_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_sites_location_id" FOREIGN KEY ("location_id") REFERENCES "${schema}"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      );
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions

    await queryRunner.query(`DROP TABLE IF EXISTS "${schema}"."sites";`)
  }
}
