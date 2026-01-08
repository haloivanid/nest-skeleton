import { UserEntityCreationPayload, UserEntityFields } from '@module/users/domain';
import { Entity, EntityFieldSchema } from '@libs/core/domain';
import { z } from 'zod';
import { UserEmailValueObject } from '@module/users/domain/user-email.vo';

export class User extends Entity<UserEntityFields, UserEntityCreationPayload> {
  declare protected _id: string;

  protected getEntityFieldsSchema(): EntityFieldSchema<UserEntityFields> {
    return z
      .object({
        name: z.string(),
        email: z.instanceof(UserEmailValueObject),
        password: z.string(),
        deletedAt: z.date().nullable(),
      })
      .strict();
  }

  static create(user: UserEntityCreationPayload) {
    const entity = new User(user);
    entity.logger.debug(JSON.stringify({ state: 'ENTITY_CREATION', payload: entity.toObject() }));
    return entity;
  }

  async validatePassword(
    candidate: string,
    comparator: (raw: string, hash: string) => boolean | Promise<boolean>,
  ): Promise<boolean> {
    return comparator(candidate, this._fields.password);
  }
}
