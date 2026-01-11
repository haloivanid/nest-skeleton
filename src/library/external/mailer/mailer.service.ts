import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { MAILER_OPTIONS, MAILER_TRANSPORT_FACTORY } from './mailer.constant';
import { MailerOptions, TransportType } from './types/mailer-options.interface';
import { IMailerTransportFactoryOptions } from './types/mailer-transport-factory-options.interface';
import { MailerTransportFactory } from './mailer-transport-factory';
import * as smtpTransport from 'nodemailer/lib/smtp-transport';
import { SentMessageInfo, Transporter } from 'nodemailer';
import { ISendMailOptions } from './types/send-mail.interface';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter!: Transporter;
  private transporters = new Map<string, Transporter>();

  constructor(
    @Inject(MAILER_OPTIONS) private readonly mailerOptions: MailerOptions,
    @Optional()
    @Inject(MAILER_TRANSPORT_FACTORY)
    private readonly transportFactory: IMailerTransportFactoryOptions,
  ) {
    if (!transportFactory) {
      this.transportFactory = new MailerTransportFactory(mailerOptions);
    }

    this.setupTransporters();
    this.validateTransportOptions();
  }

  addTransporter(transporterName: string, config: string | smtpTransport | smtpTransport.Options): string {
    this.transporters.set(transporterName, this.transportFactory.createTransport(config));
    return transporterName;
  }

  async sendMail(sendMailOptions: ISendMailOptions): Promise<SentMessageInfo> {
    const transporter = sendMailOptions.transporterName
      ? this.transporters.get(sendMailOptions.transporterName)
      : this.transporter;

    if (!transporter) {
      throw new ReferenceError(
        sendMailOptions.transporterName
          ? `Transporters object doesn't have ${sendMailOptions.transporterName} key`
          : `Transporter object undefined`,
      );
    }

    return transporter.sendMail(sendMailOptions);
  }

  async verifyAllTransporters() {
    const transporters = [...this.transporters.values(), this.transporter].filter(Boolean);
    const transportersVerified = await Promise.all(
      transporters.map(async (t) => {
        if (!t.verify) return true;
        return Promise.resolve(t.verify())
          .then(() => true)
          .catch(() => false);
      }),
    );

    return transportersVerified.every((verified) => verified);
  }

  private validateTransportOptions(): void {
    if (
      (!this.mailerOptions.transporters || Object.keys(this.mailerOptions.transporters).length <= 0) &&
      !this.mailerOptions.transporters
    ) {
      throw new Error(
        'Make sure to provide a nodemailer transport configuration object, connection url or a transport plugin instance.',
      );
    }
  }

  private verifyTransporter(transporter: Transporter, name?: string): void {
    const transporterName = name ? ` '${name}'` : '';
    if (!transporter.verify) return;
    Promise.resolve(transporter.verify())
      .then(() => this.logger.debug(`Transporter${transporterName} is ready`))
      .catch((error) =>
        this.logger.error(`Error occurred while verifying the transporter${transporterName}: ${error.message}`),
      );
  }

  private createTransporter(
    config: string | smtpTransport | smtpTransport.Options | TransportType,
    name?: string,
  ): Transporter {
    const transporter = this.transportFactory.createTransport(config);
    if (this.mailerOptions.verifyTransporters) this.verifyTransporter(transporter, name);
    return transporter;
  }

  private setupTransporters(): void {
    if (this.mailerOptions.transporters) {
      Object.keys(this.mailerOptions.transporters).forEach((name) => {
        const transporter = this.createTransporter(this.mailerOptions.transporters![name], name);
        this.transporters.set(name, transporter);
      });
    }

    if (this.mailerOptions.defaults) {
      this.transporter = this.createTransporter(this.mailerOptions.defaults);
    }
  }
}
