import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUsers1739777835342 implements MigrationInterface {
  name = 'AddUsers1739777835342'
  publicSchema = 'public'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // add users
    await queryRunner.query(`
      CREATE TABLE "${this.publicSchema}"."users" (
        "user_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "first_name" VARCHAR(255),
        "last_name" VARCHAR(255),
        "email" VARCHAR(255),
        "password" VARCHAR(255),
        "refresh_token" VARCHAR(255),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_user_id" PRIMARY KEY ("user_id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      );
    `)

    // add users_trgm index
    await queryRunner.query(`
      CREATE INDEX "IDX_users_trgm" ON "${this.publicSchema}"."users"
      USING GIN ((first_name || ' ' || last_name || ' ' || email) gin_trgm_ops);
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // remove users_trgm index
    await queryRunner.query(
      `DROP INDEX IF EXISTS "${this.publicSchema}"."IDX_users_trgm";`,
    )
    // remove users
    await queryRunner.query(
      `DROP TABLE IF EXISTS "${this.publicSchema}"."users";`,
    )
  }
}
