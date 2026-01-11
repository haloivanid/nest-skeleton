import { Module } from '@nestjs/common';
import { UserMapper } from './user.mapper';
import { UserEmailMapper } from './user-email.mapper';
import { CryptModule } from '@libs/core/providers/crypt';

@Module({
  imports: [CryptModule.register()],
  providers: [UserMapper, UserEmailMapper],
  exports: [UserMapper, UserEmailMapper],
})
export class UserMapperModule {}
