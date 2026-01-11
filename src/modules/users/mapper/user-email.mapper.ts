import { Injectable } from '@nestjs/common';
import { UserEmailValueObject } from '@module/users/domain';
import { EmailEmbed } from '@db/embed';
import { CryptService } from '@libs/core/providers/crypt';

@Injectable()
export class UserEmailMapper {
  constructor(private readonly crypt: CryptService) {}

  fromRawToRepositoryEntity(email: string) {
    const mask = this.toMask(email);
    const lookup = this.crypt.toLookupData(email);
    const blob = this.crypt.toCipherData(email);

    return { mask, lookup, blob };
  }

  fromDomainToRepositoryEntity(domain: UserEmailValueObject): EmailEmbed {
    const email = domain.unpack() as string;
    const mask = this.toMask(email);
    const lookup = this.crypt.toLookupData(email);
    const blob = this.crypt.toCipherData(email);

    return { mask, lookup, blob };
  }

  fromRepositoryEntityToDomain(embed: EmailEmbed): UserEmailValueObject {
    return UserEmailValueObject.create(this.crypt.fromCipherData(embed.blob));
  }

  fromRepositoryEntityToResponseUnMask(embed: EmailEmbed): string {
    return this.crypt.fromCipherData(embed.blob);
  }

  fromDomainToResponse(domain: UserEmailValueObject): string {
    return this.toMask(domain.unpack() as string);
  }

  fromUserToResponse(email: string): string {
    return this.toMask(email);
  }

  fromRequestToLookup(email: string): Buffer {
    return this.crypt.toLookupData(email);
  }

  private toMask(email: string) {
    const atIndex = email.lastIndexOf('@');
    if (atIndex < 1) {
      return email;
    }
    return email.substring(0, 1) + '*****' + email.substring(atIndex);
  }
}
