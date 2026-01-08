import { User } from '@module/users/domain';
import { Query } from '@nestjs/cqrs';

export class UserPasswordAttemptQuery extends Query<boolean> {
  constructor(
    public readonly password: string,
    public readonly user: User,
  ) {
    super();
  }
}
