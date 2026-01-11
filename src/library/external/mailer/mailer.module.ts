import { DynamicModule, Module } from '@nestjs/common';
import { MailerAsyncOptions } from './types/mailer-async-options.interface';
import { MailerCoreModule } from './mailer-core.module';
import { MailerOptions } from './types/mailer-options.interface';

@Module({})
export class MailerModule {
  public static forRoot(options: MailerOptions): DynamicModule {
    return { module: MailerModule, imports: [MailerCoreModule.forRoot(options)] };
  }

  public static forRootAsync(options: MailerAsyncOptions): DynamicModule {
    return { module: MailerModule, imports: [MailerCoreModule.forRootAsync(options)] };
  }
}
