import { mailerConfig } from '@conf/mailer';
import { MailerModule } from '@libs/external/mailer';
import { Module } from '@nestjs/common';
import { UserRegisterEmailEventHandler } from './event-handler/user-register-mailer.event-handler';

@Module({ imports: [MailerModule.forRootAsync(mailerConfig)], providers: [UserRegisterEmailEventHandler] })
export class ExternalMailerModule {}
