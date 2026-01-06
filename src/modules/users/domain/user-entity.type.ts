import { BaseEntityFields, CommonEntityFields, DomainCreationPayload } from '@libs/core/domain';
import { UserEmailValueObject } from '@module/users/domain/user-email.vo';

export interface UserEntityFields extends BaseEntityFields {
  name: string;
  email: UserEmailValueObject;
  password: string;
  deletedAt: Date | null;
}

export type UserEntity = CommonEntityFields & UserEntityFields;
export type UserEntityCreationPayload = DomainCreationPayload<UserEntityFields>;
