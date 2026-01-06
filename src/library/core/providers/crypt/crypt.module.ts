import { DynamicModule, Module } from '@nestjs/common';
import { CryptService } from '@libs/core/providers/crypt/crypt.service';

@Module({})
export class CryptModule {
  static register(): DynamicModule {
    return { module: CryptModule, providers: [CryptService], exports: [CryptService] };
  }
}
