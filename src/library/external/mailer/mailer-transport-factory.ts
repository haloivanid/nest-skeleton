import { Inject } from '@nestjs/common';
import { MAILER_OPTIONS } from './mailer.constant';
import { MailerOptions } from './types/mailer-options.interface';
import { TransportType } from './types/mailer-options.interface';
import { IMailerTransportFactoryOptions } from './types/mailer-transport-factory-options.interface';
import Mail from 'nodemailer/lib/mailer';
import { createTransport } from 'nodemailer';

export class MailerTransportFactory implements IMailerTransportFactoryOptions {
  constructor(
    @Inject(MAILER_OPTIONS)
    private readonly options: MailerOptions,
  ) {}

  createTransport(options?: TransportType): Mail {
    return createTransport(options || this.options.transporters || this.options.defaults, this.options.defaults);
  }
}
