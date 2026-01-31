import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface MailerConfig {
  mode: 'development' | 'production';
  smtp?: {
    host: string;
    port: number;
    secure?: boolean;
    auth?: {
      user: string;
      pass: string;
    };
  };
  from?: {
    email: string;
    name: string;
  };
}

/**
 * Email sending service
 * - Development: Logs to console
 * - Production: Sends via SMTP
 */
export class Mailer {
  private transporter: Transporter<SMTPTransport.SentMessageInfo> | null = null;
  private config: MailerConfig;

  constructor(config: MailerConfig) {
    this.config = config;

    if (config.mode === 'production' && config.smtp) {
      this.transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure ?? false,
        auth: config.smtp.auth,
      });
    }
  }

  /**
   * Send an email
   * In development mode, emails are logged to console instead of being sent
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    const fromAddress = this.config.from
      ? `${this.config.from.name} <${this.config.from.email}>`
      : options.from || 'noreply@eventuras.local';

    if (this.config.mode === 'development') {
      console.log('\n📧 Email (Development Mode - Not Sent)');
      console.log('─'.repeat(60));
      console.log(`From: ${fromAddress}`);
      console.log(`To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log('─'.repeat(60));
      console.log('HTML Content:');
      console.log(options.html);
      if (options.text) {
        console.log('─'.repeat(60));
        console.log('Text Content:');
        console.log(options.text);
      }
      console.log('─'.repeat(60));
      console.log('');
      return;
    }

    if (!this.transporter) {
      throw new Error('SMTP transporter not configured for production mode');
    }

    await this.transporter.sendMail({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }

  /**
   * Verify SMTP connection (production mode only)
   */
  async verify(): Promise<boolean> {
    if (this.config.mode === 'development') {
      return true;
    }

    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP verification failed:', error);
      return false;
    }
  }

  /**
   * Close the SMTP connection
   */
  async close(): Promise<void> {
    if (this.transporter) {
      this.transporter.close();
    }
  }
}

/**
 * Create a mailer instance from environment variables
 */
export function createMailerFromEnv(): Mailer {
  const mode =
    process.env.NODE_ENV === 'production' ? 'production' : 'development';

  const config: MailerConfig = { mode };

  if (mode === 'production') {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
      throw new Error(
        'SMTP configuration missing. Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS'
      );
    }

    config.smtp = {
      host,
      port: parseInt(port, 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
    };
  }

  const fromEmail = process.env.SMTP_FROM_EMAIL;
  const fromName = process.env.SMTP_FROM_NAME;

  if (fromEmail && fromName) {
    config.from = { email: fromEmail, name: fromName };
  }

  return new Mailer(config);
}
