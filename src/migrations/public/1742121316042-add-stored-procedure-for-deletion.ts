import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddStoredProcedureForDeletion1742121316042
  implements MigrationInterface
{
  name = 'AddStoredProcedureForDeletion1742121316042'
  publicSchema = 'public'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE PROCEDURE "${this.publicSchema}"."expire_user_cache" (retention_period INTERVAL) AS
      $$
      BEGIN
          DELETE FROM public.cache
          WHERE inserted_at < NOW() - retention_period;

          COMMIT;
      END;
      $$ LANGUAGE plpgsql;
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP PROCEDURE IF EXISTS "${this.publicSchema}"."expire_user_cache";
    `)
  }
}
