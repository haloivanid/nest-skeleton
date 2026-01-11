import { ValidatedEnv } from '@conf/env';
import { MailerAsyncOptions, MailerOptions } from '@libs/external/mailer';
import { ConfigService } from '@nestjs/config';

export const mailerConfig: MailerAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService<ValidatedEnv, true>) => configCreation(configService),
};

function configCreation(configService: ConfigService<ValidatedEnv, true>): MailerOptions {
  return {
    defaults: {
      host: configService.get<string>('SMTP_HOST', { infer: true }),
      port: configService.get<number>('SMTP_PORT', { infer: true }),
      auth: {
        user: configService.get<string>('SMTP_USER', { infer: true }),
        pass: configService.get<string>('SMTP_PASS', { infer: true }),
      },
    },
    transporters: {},
  };
}
