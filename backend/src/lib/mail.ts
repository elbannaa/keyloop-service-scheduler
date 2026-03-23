import nodemailer from 'nodemailer';
import { config } from '@/config';

export class MailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private async initTransporter() {
    this.transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: false,
      auth: {
        user: config.mail.user,
        pass: config.mail.pass,
      },
    });
  }

  async sendEmail({
    to,
    subject,
    body,
  }: {
    to: string;
    subject: string;
    body: string;
  }) {
    try {
      if (!this.transporter) {
        await this.initTransporter();
      }

      if (!this.transporter) {
        console.warn('Mail transporter not initialized. Logging email to console:');
        console.log(`To: ${to}\nSubject: ${subject}\nBody: ${body}`);
        return;
      }

      const info = await this.transporter.sendMail({
        from: config.mail.from,
        to,
        subject,
        text: body,
      });

      console.log(`Email sent: ${info.messageId}`);
      if (info.messageId && config.mail.host === 'smtp.ethereal.email' || !config.mail.user) {
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

}

export const mailService = new MailService();