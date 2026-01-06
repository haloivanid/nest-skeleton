import { ValueObject } from '@libs/core/domain';

export class UserEmailValueObject extends ValueObject<string> {
  static create(obj: string) {
    return new UserEmailValueObject(obj);
  }
}
