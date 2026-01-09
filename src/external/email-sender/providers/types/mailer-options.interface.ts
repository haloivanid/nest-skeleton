import { Transport, TransportOptions } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import SendmailTransport from 'nodemailer/lib/sendmail-transport';
import StreamTransport from 'nodemailer/lib/stream-transport';
import JSONTransport from 'nodemailer/lib/json-transport';
import SESTransport from 'nodemailer/lib/ses-transport';

// import { TemplateAdapter } from './template-adapter.interface';

type Options =
  | SMTPTransport.Options
  | SMTPPool.Options
  | SendmailTransport.Options
  | StreamTransport.Options
  | JSONTransport.Options
  | SESTransport.Options
  | TransportOptions;

export type TransportType =
  | Options
  | SMTPTransport
  | SMTPPool
  | SendmailTransport
  | StreamTransport
  | JSONTransport
  | SESTransport
  | Transport
  | string;

export interface MailerOptions {
  defaults?: Options;
  transporters?: { [name: string]: TransportType };
  verifyTransporters?: boolean;
}
