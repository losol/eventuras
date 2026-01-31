import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Mailer, createMailerFromEnv } from '../mailer';
import type { MailerConfig, EmailOptions } from '../mailer';

describe('Mailer', () => {
  describe('Development Mode', () => {
    let mailer: Mailer;
    let consoleLogSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      mailer = new Mailer({ mode: 'development' });
      consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it('should log email to console instead of sending', async () => {
      const emailOptions: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      };

      await mailer.sendEmail(emailOptions);

      expect(consoleLogSpy).toHaveBeenCalled();
      const loggedOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      expect(loggedOutput).toContain('test@example.com');
      expect(loggedOutput).toContain('Test Email');
      expect(loggedOutput).toContain('<p>Test content</p>');
    });

    it('should handle multiple recipients', async () => {
      const emailOptions: EmailOptions = {
        to: ['user1@example.com', 'user2@example.com'],
        subject: 'Test Email',
        html: '<p>Test content</p>',
      };

      await mailer.sendEmail(emailOptions);

      const loggedOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      expect(loggedOutput).toContain('user1@example.com');
      expect(loggedOutput).toContain('user2@example.com');
    });

    it('should use custom from address when provided', async () => {
      const mailerWithFrom = new Mailer({
        mode: 'development',
        from: { email: 'custom@example.com', name: 'Custom Sender' },
      });

      const emailOptions: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      };

      await mailerWithFrom.sendEmail(emailOptions);

      const loggedOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      expect(loggedOutput).toContain('Custom Sender <custom@example.com>');
    });

    it('should use default from address when not provided', async () => {
      const emailOptions: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      };

      await mailer.sendEmail(emailOptions);

      const loggedOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      expect(loggedOutput).toContain('noreply@eventuras.local');
    });

    it('should log both HTML and text content when provided', async () => {
      const emailOptions: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>HTML content</p>',
        text: 'Text content',
      };

      await mailer.sendEmail(emailOptions);

      const loggedOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      expect(loggedOutput).toContain('HTML content');
      expect(loggedOutput).toContain('Text content');
    });

    it('should verify successfully in development mode', async () => {
      const result = await mailer.verify();
      expect(result).toBe(true);
    });

    it('should close without errors', async () => {
      await expect(mailer.close()).resolves.toBeUndefined();
    });
  });

  describe('Production Mode', () => {
    const validSmtpConfig: MailerConfig = {
      mode: 'production',
      smtp: {
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'password',
        },
      },
    };

    it('should create mailer with SMTP configuration', () => {
      const mailer = new Mailer(validSmtpConfig);
      expect(mailer).toBeDefined();
    });

    it('should throw error when sending without SMTP configuration', async () => {
      const mailer = new Mailer({ mode: 'production' }); // No SMTP config

      const emailOptions: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      };

      await expect(mailer.sendEmail(emailOptions)).rejects.toThrow(
        'SMTP transporter not configured for production mode'
      );
    });

    it('should return false when verifying without SMTP configuration', async () => {
      const mailer = new Mailer({ mode: 'production' }); // No SMTP config
      const result = await mailer.verify();
      expect(result).toBe(false);
    });

    it('should use secure connection when configured', () => {
      const secureConfig: MailerConfig = {
        mode: 'production',
        smtp: {
          host: 'smtp.example.com',
          port: 465,
          secure: true,
          auth: {
            user: 'test@example.com',
            pass: 'password',
          },
        },
      };

      const mailer = new Mailer(secureConfig);
      expect(mailer).toBeDefined();
    });

    it('should default secure to false when not specified', () => {
      const configWithoutSecure: MailerConfig = {
        mode: 'production',
        smtp: {
          host: 'smtp.example.com',
          port: 587,
          auth: {
            user: 'test@example.com',
            pass: 'password',
          },
        },
      };

      const mailer = new Mailer(configWithoutSecure);
      expect(mailer).toBeDefined();
    });
  });

  describe('createMailerFromEnv', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      vi.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should create development mailer when NODE_ENV is not production', () => {
      process.env.NODE_ENV = 'development';
      const mailer = createMailerFromEnv();
      expect(mailer).toBeDefined();
    });

    it('should create development mailer when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test';
      const mailer = createMailerFromEnv();
      expect(mailer).toBeDefined();
    });

    it('should throw error when production mode missing SMTP_HOST', () => {
      process.env.NODE_ENV = 'production';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASS = 'password';

      expect(() => createMailerFromEnv()).toThrow(
        'SMTP configuration missing. Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS'
      );
    });

    it('should throw error when production mode missing SMTP_PORT', () => {
      process.env.NODE_ENV = 'production';
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASS = 'password';

      expect(() => createMailerFromEnv()).toThrow(
        'SMTP configuration missing. Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS'
      );
    });

    it('should throw error when production mode missing SMTP_USER', () => {
      process.env.NODE_ENV = 'production';
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_PASS = 'password';

      expect(() => createMailerFromEnv()).toThrow(
        'SMTP configuration missing. Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS'
      );
    });

    it('should throw error when production mode missing SMTP_PASS', () => {
      process.env.NODE_ENV = 'production';
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'user@example.com';

      expect(() => createMailerFromEnv()).toThrow(
        'SMTP configuration missing. Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS'
      );
    });

    it('should create production mailer with all SMTP env vars', () => {
      process.env.NODE_ENV = 'production';
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASS = 'password';

      const mailer = createMailerFromEnv();
      expect(mailer).toBeDefined();
    });

    it('should parse SMTP_SECURE as boolean', () => {
      process.env.NODE_ENV = 'production';
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_PORT = '465';
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASS = 'password';
      process.env.SMTP_SECURE = 'true';

      const mailer = createMailerFromEnv();
      expect(mailer).toBeDefined();
    });

    it('should parse SMTP_PORT as integer', () => {
      process.env.NODE_ENV = 'production';
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASS = 'password';

      const mailer = createMailerFromEnv();
      expect(mailer).toBeDefined();
    });

    it('should configure from address when SMTP_FROM_EMAIL and SMTP_FROM_NAME are set', () => {
      process.env.NODE_ENV = 'development';
      process.env.SMTP_FROM_EMAIL = 'custom@example.com';
      process.env.SMTP_FROM_NAME = 'Custom Sender';

      const mailer = createMailerFromEnv();
      expect(mailer).toBeDefined();
    });

    it('should not configure from address when only SMTP_FROM_EMAIL is set', () => {
      process.env.NODE_ENV = 'development';
      process.env.SMTP_FROM_EMAIL = 'custom@example.com';

      const mailer = createMailerFromEnv();
      expect(mailer).toBeDefined();
    });

    it('should not configure from address when only SMTP_FROM_NAME is set', () => {
      process.env.NODE_ENV = 'development';
      process.env.SMTP_FROM_NAME = 'Custom Sender';

      const mailer = createMailerFromEnv();
      expect(mailer).toBeDefined();
    });

    it('should handle production mode with all optional settings', () => {
      process.env.NODE_ENV = 'production';
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_PORT = '465';
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASS = 'password';
      process.env.SMTP_SECURE = 'true';
      process.env.SMTP_FROM_EMAIL = 'noreply@example.com';
      process.env.SMTP_FROM_NAME = 'Example App';

      const mailer = createMailerFromEnv();
      expect(mailer).toBeDefined();
    });
  });

  describe('Email Options', () => {
    let mailer: Mailer;
    let consoleLogSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      mailer = new Mailer({ mode: 'development' });
      consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it('should handle string recipient', async () => {
      await mailer.sendEmail({
        to: 'single@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      const loggedOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      expect(loggedOutput).toContain('single@example.com');
    });

    it('should handle array of recipients', async () => {
      await mailer.sendEmail({
        to: ['one@example.com', 'two@example.com', 'three@example.com'],
        subject: 'Test',
        html: '<p>Test</p>',
      });

      const loggedOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      expect(loggedOutput).toContain('one@example.com');
      expect(loggedOutput).toContain('two@example.com');
      expect(loggedOutput).toContain('three@example.com');
    });

    it('should use options.from when provided and no config.from', async () => {
      await mailer.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        from: 'override@example.com',
      });

      const loggedOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      expect(loggedOutput).toContain('override@example.com');
    });

    it('should prioritize config.from over options.from', async () => {
      const mailerWithFrom = new Mailer({
        mode: 'development',
        from: { email: 'config@example.com', name: 'Config Sender' },
      });

      await mailerWithFrom.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        from: 'options@example.com',
      });

      const loggedOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      expect(loggedOutput).toContain('Config Sender <config@example.com>');
      expect(loggedOutput).not.toContain('options@example.com');
    });
  });
});
