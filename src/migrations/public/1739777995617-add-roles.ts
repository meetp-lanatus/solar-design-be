import { MigrationInterface, QueryRunner } from 'typeorm'

import { RoleEnum } from '../../modules/public/user/entities/role.entity'

export class AddRoles1739777995617 implements MigrationInterface {
  name = 'AddRoles1739777995617'
  publicSchema = 'public'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // add roles
    await queryRunner.query(`
      CREATE TABLE "${this.publicSchema}"."roles" (
        "id" SERIAL NOT NULL,
        "name" VARCHAR(50) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_roles_id" PRIMARY KEY ("id")
      );
    `)

    // add default values
    for (const roleName of Object.values(RoleEnum)) {
      await queryRunner.query(
        `INSERT INTO "${this.publicSchema}"."roles" (name) VALUES ('${roleName}');`,
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // remove roles
    await queryRunner.query(
      `DROP TABLE IF EXISTS "${this.publicSchema}"."roles";`,
    )
  }
}
