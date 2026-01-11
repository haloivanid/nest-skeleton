import { MailerService } from '@libs/external/mailer';
import { AppCtxService } from '@libs/core/providers/app-ctx';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserRegisteredDomainEvent } from '@module/users/domain';
import { render } from '@react-email/render';
import { UserRegisterEmail } from '@view/mails/user-register.mail';

@Injectable()
export class UserRegisterEmailEventHandler {
  private readonly logger = new Logger(UserRegisterEmailEventHandler.name);
  constructor(
    private readonly mailerService: MailerService,
    private readonly appCtx: AppCtxService,
  ) {}

  @OnEvent(UserRegisteredDomainEvent.name, { async: true, promisify: true })
  async handle(event: UserRegisteredDomainEvent): Promise<void> {
    this.mailerService
      .sendMail({
        subject: 'User Email Register',
        from: 'ivanazis <ivanazis.id@gmail.com>',
        to: event.email,
        html: await render(UserRegisterEmail({ name: event.name })),
      })
      .then((result) => this.logger.debug(JSON.stringify({ ...this.appCtx.context, result })))
      .catch((err) => this.logger.error(JSON.stringify({ failCausation: err.message })));
  }
}
