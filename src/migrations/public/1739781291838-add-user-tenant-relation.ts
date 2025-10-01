import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserTenantRelation1739781291838 implements MigrationInterface {
  name = 'AddUserTenantRelation1739781291838'
  publicSchema = 'public'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // add user_tenant_relation
    await queryRunner.query(`
      CREATE TABLE "${this.publicSchema}"."user_tenant_relation" (
        "id" SERIAL NOT NULL,
        "user_id" UUID NOT NULL,
        "tenant_id" INTEGER NOT NULL,
        "role_id" INTEGER NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_tenant_relation_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_tenant_relation_user_id" FOREIGN KEY ("user_id") REFERENCES "${this.publicSchema}"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_user_tenant_relation_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "${this.publicSchema}"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_user_tenant_relation_role_id" FOREIGN KEY ("role_id") REFERENCES "${this.publicSchema}"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "UQ_user_tenant_relation_user_tenant" UNIQUE ("user_id", "tenant_id")
      );
    `)

    // add indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_user_tenant_relation_user_id" ON "${this.publicSchema}"."user_tenant_relation" ("user_id");`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_user_tenant_relation_tenant_id" ON "${this.publicSchema}"."user_tenant_relation" ("tenant_id");`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // remove indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "${this.publicSchema}"."IDX_user_tenant_relation_tenant_id";`,
    )
    await queryRunner.query(
      `DROP INDEX IF EXISTS "${this.publicSchema}"."IDX_user_tenant_relation_user_id";`,
    )
    // remove user_tenant_relation
    await queryRunner.query(
      `DROP TABLE IF EXISTS "${this.publicSchema}"."user_tenant_relation";`,
    )
  }
}
