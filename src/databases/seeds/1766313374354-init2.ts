import { MigrationInterface, QueryRunner } from 'typeorm';
import { UsersTypeormEntity } from '@db/entities/users.typeorm-entity';
import * as bcrypt from 'bcryptjs';

const userId = '705cf40e-fea6-49e3-9d1d-9cc75b333662' as const;

export class Init21766313374354 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const users = new UsersTypeormEntity();
    users.email = 'default@email.com';
    users.password = await bcrypt.hash(
      process.env.DEFAULT_USER_PASSWORD || 'Satudua3!',
      +(process.env.PASSWORD_SALT || 10),
    );
    users.name = 'default';
    users.id = userId;

    await queryRunner.manager.getRepository(UsersTypeormEntity).save(users);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.getRepository(UsersTypeormEntity).delete(userId);
  }
}
