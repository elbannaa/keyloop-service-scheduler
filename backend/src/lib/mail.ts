import nodemailer from 'nodemailer';
import { config } from '@/config';

export interface EmailDeliveryResult {
  delivered: boolean;
  mode: 'disabled' | 'log' | 'smtp';
  messageId?: string;
}

const splitRecipients = (value: string): string[] =>
  value
    .split(/[;,]/)
    .map((recipient) => recipient.trim())
    .filter(Boolean);

const extractAddress = (value: string): string => {
  const displayNameMatch = value.match(/<([^>]+)>/);
  return (displayNameMatch?.[1] || value).trim().toLowerCase();
};

const getDomain = (value: string): string => {
  const address = extractAddress(value);
  const atIndex = address.lastIndexOf('@');
  return atIndex >= 0 ? address.slice(atIndex + 1) : '';
};

const isDomainAllowed = (domain: string): boolean =>
  config.mail.allowedDomains.some(
    (allowedDomain) => domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)
  );

export class MailService {
  private transporter: nodemailer.Transporter | null = null;

  private initTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: config.mail.host,
        port: config.mail.port,
        secure: config.mail.secure,
        auth: {
          user: config.mail.user,
          pass: config.mail.pass,
        },
      });
    }

    return this.transporter;
  }

  async sendEmail({
    to,
    subject,
    body,
  }: {
    to: string;
    subject: string;
    body: string;
  }): Promise<EmailDeliveryResult> {
    const recipients = splitRecipients(to);

    if (config.mail.mode === 'disabled') {
      console.info(`[mail] Suppressed outbound message; recipientCount=${recipients.length}`);
      return { delivered: false, mode: 'disabled' };
    }

    if (config.mail.mode === 'log') {
      // Do not log recipient addresses, subject, or body because they can contain PII.
      console.info(`[mail] Logged-only message; recipientCount=${recipients.length}`);
      return { delivered: false, mode: 'log' };
    }

    if (recipients.length === 0) {
      throw new Error('Outbound email blocked: no valid recipient was supplied');
    }

    const blockedDomains = recipients
      .map(getDomain)
      .filter((domain) => !domain || !isDomainAllowed(domain));

    if (blockedDomains.length > 0) {
      throw new Error(
        'Outbound email blocked: one or more recipient domains are not in MAIL_ALLOWED_DOMAINS'
      );
    }

    const transporter = this.initTransporter();
    const info = await transporter.sendMail({
      from: config.mail.from,
      to,
      subject,
      text: body,
    });

    console.info('[mail] Message delivered through approved SMTP policy');
    return {
      delivered: true,
      mode: 'smtp',
      messageId: info.messageId,
    };
  }
}

export const mailService = new MailService();
