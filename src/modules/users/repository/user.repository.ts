import { UsersTypeormEntity } from '@db/entities/users.typeorm-entity';
import { Repository } from 'typeorm';

export abstract class UserRepository extends Repository<UsersTypeormEntity> {
  abstract findOneByEmail(email: Buffer): Promise<UsersTypeormEntity | null>;
}
