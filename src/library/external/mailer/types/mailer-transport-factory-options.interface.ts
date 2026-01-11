import Mail from 'nodemailer/lib/mailer';
import { TransportType } from './mailer-options.interface';

export interface IMailerTransportFactoryOptions {
  createTransport(options?: TransportType): Mail;
}
