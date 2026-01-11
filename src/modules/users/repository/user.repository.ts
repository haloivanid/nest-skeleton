import { BaseTypeOrmPort } from '@db/base/base.typeorm-port';
import { UsersTypeormEntity } from '@db/entities/users.typeorm-entity';
import { User } from '@module/users/domain';
import { UserMapper } from '../mapper';

export abstract class UserRepository extends BaseTypeOrmPort<User, UsersTypeormEntity, UserMapper> {
  abstract findOneByEmail(email: Buffer): Promise<UsersTypeormEntity | null>;
}
