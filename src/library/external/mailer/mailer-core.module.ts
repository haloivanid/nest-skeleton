import { ValueProvider } from '@nestjs/common/interfaces';
import { DynamicModule, Module, Global, Provider } from '@nestjs/common';
import { MAILER_OPTIONS } from './mailer.constant';
import { MailerOptions } from './types/mailer-options.interface';
import { MailerAsyncOptions } from './types/mailer-async-options.interface';
import { MailerOptionsFactory } from './types/mailer-options-factory.interface';
import { MailerService } from './mailer.service';

@Global()
@Module({})
export class MailerCoreModule {
  public static forRoot(options: MailerOptions): DynamicModule {
    const MailerOptionsProvider: ValueProvider<MailerOptions> = { provide: MAILER_OPTIONS, useValue: options };

    return { module: MailerCoreModule, providers: [MailerOptionsProvider, MailerService], exports: [MailerService] };
  }

  public static forRootAsync(options: MailerAsyncOptions): DynamicModule {
    const providers: Provider[] = this.createAsyncProviders(options);

    return {
      module: MailerCoreModule,
      providers: [...providers, MailerService, ...(options.extraProviders || [])],
      imports: options.imports,
      exports: [MailerService],
    };
  }

  private static createAsyncProviders(options: MailerAsyncOptions): Provider[] {
    const providers: Provider[] = [this.createAsyncOptionsProvider(options)];

    if (options.useClass) {
      providers.push({ provide: options.useClass, useClass: options.useClass });
    }

    return providers;
  }

  private static createAsyncOptionsProvider(options: MailerAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        name: MAILER_OPTIONS,
        provide: MAILER_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      name: MAILER_OPTIONS,
      provide: MAILER_OPTIONS,
      useFactory: async (optionsFactory: MailerOptionsFactory) => {
        return optionsFactory.createMailerOptions();
      },
      inject: [options.useExisting! || options.useClass!],
    };
  }
}
