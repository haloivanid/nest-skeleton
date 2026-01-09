import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1767895598136 implements MigrationInterface {
  name = 'Init1767895598136';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" character varying NOT NULL, "name" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "email_mask" character varying(255) NOT NULL, "email_lookup" bytea NOT NULL, "email_blob" bytea NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_51b8b26ac168fbe7d6f5653e6c" ON "users" ("name") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_a6e21b30f082730fe3d8f1cac0" ON "users" ("deleted_at") WHERE deleted_at IS NOT NULL`,
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ac4d94877148c08531eceae8bc" ON "users" ("email_lookup") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_ac4d94877148c08531eceae8bc"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a6e21b30f082730fe3d8f1cac0"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_51b8b26ac168fbe7d6f5653e6c"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
