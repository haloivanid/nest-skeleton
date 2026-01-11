import { UserEntityCreationPayload, UserEntityFields } from '@module/users/domain';
import { Entity, EntityFieldSchema } from '@libs/core/domain';
import { z } from 'zod';
import { UserEmailValueObject } from '@module/users/domain/user-email.vo';
import { entityId } from '@libs/utils/uid';
import { UserRegisteredDomainEvent } from './event/user-registered.domain-event';
import { time } from '@libs/utils';

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

  static register(fields: UserEntityFields) {
    const entity = new User({ id: entityId(), fields });

    entity.addEvent(
      new UserRegisteredDomainEvent({
        email: entity._fields.email.unpack() as string,
        name: entity._fields.name,
        aggregateId: entity.id,
        metadata: { correlationId: entity.id, occurredAt: time().unix() },
      }),
    );

    return entity;
  }

  async validatePassword(
    candidate: string,
    comparator: (raw: string, hash: string) => boolean | Promise<boolean>,
  ): Promise<boolean> {
    return comparator(candidate, this._fields.password);
  }
}
