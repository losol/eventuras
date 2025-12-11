# Postor-Mailer: Nodemailer-Based Email Library for Eventuras

**Date**: December 2025  
**Library Name**: `@eventuras/postor-mailer`  
**Technology**: Nodemailer (no templating)

## Overview

Postor-mailer is a lightweight TypeScript wrapper around Nodemailer for sending emails in the Eventuras monorepo. It provides a simple, type-safe interface for email delivery **without** built-in templating. Templating will be handled by a separate library using Handlebars.

## Design Principles

1. **Separation of Concerns**: Email sending logic separate from templating
2. **Transport Flexibility**: Support multiple transports (SMTP, SendGrid, SES, etc.)
3. **Type Safety**: Full TypeScript support
4. **Testing**: Easy mocking and testing capabilities
5. **Logging**: Integration with `@eventuras/logger`
6. **No Templating**: Accept pre-rendered HTML strings

## Architecture

```
libs/
  postor-mailer/              # Email sending library
    src/
      index.ts                # Main exports
      client.ts               # Email client implementation
      transports.ts           # Transport factory
      types.ts                # TypeScript types
      __tests__/              # Unit tests
        client.test.ts
    package.json
    tsconfig.json
    README.md

  <future: templating library with Handlebars>
```

## Installation

```bash
cd libs/
mkdir postor-mailer
cd postor-mailer
pnpm init
```

### Dependencies

```json
{
  "name": "@eventuras/postor-mailer",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "dependencies": {
    "nodemailer": "^6.9.13",
    "@eventuras/logger": "workspace:*"
  },
  "devDependencies": {
    "@types/nodemailer": "^6.4.15",
    "@eventuras/typescript-config": "workspace:*",
    "@eventuras/vite-config": "workspace:*",
    "vite": "^7.2.6",
    "vitest": "^3.0.0"
  }
}
```

## Core Implementation

### Types (`src/types.ts`)

```typescript
import type { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export type EmailTransporter = Transporter<SMTPTransport.SentMessageInfo>;

export interface SmtpConfig {
  type: 'smtp';
  host: string;
  port: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
  pool?: boolean;
  maxConnections?: number;
  maxMessages?: number;
}

export interface SendGridConfig {
  type: 'sendgrid';
  apiKey: string;
}

export interface SesConfig {
  type: 'ses';
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export type TransportConfig = SmtpConfig | SendGridConfig | SesConfig;

export interface EmailClientConfig {
  transport: TransportConfig;
  defaults?: {
    from?: string;
    replyTo?: string;
  };
}

export interface EmailAddress {
  email: string;
  name?: string;
}

export type EmailRecipient = string | EmailAddress;

export interface SendEmailOptions {
  from?: EmailRecipient;
  to: EmailRecipient | EmailRecipient[];
  cc?: EmailRecipient | EmailRecipient[];
  bcc?: EmailRecipient | EmailRecipient[];
  replyTo?: EmailRecipient;
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
}

export interface EmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
}

export interface SendEmailResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
  response: string;
}
```

### Transport Factory (`src/transports.ts`)

```typescript
import nodemailer from 'nodemailer';
import type { EmailTransporter, TransportConfig } from './types';

export function createTransport(config: TransportConfig): EmailTransporter {
  switch (config.type) {
    case 'smtp':
      return nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure ?? false,
        auth: config.auth,
        pool: config.pool ?? true,
        maxConnections: config.maxConnections ?? 5,
        maxMessages: config.maxMessages ?? 100,
      });

    case 'sendgrid':
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: config.apiKey,
        },
      });

    case 'ses':
      // AWS SES transport would need aws-sdk
      throw new Error('SES transport not yet implemented');

    default:
      const _exhaustive: never = config;
      throw new Error(`Unknown transport type: ${(_exhaustive as TransportConfig).type}`);
  }
}
```

### Email Client (`src/client.ts`)

```typescript
import { Logger } from '@eventuras/logger';
import type {
  EmailClientConfig,
  EmailRecipient,
  EmailTransporter,
  SendEmailOptions,
  SendEmailResult,
} from './types';
import { createTransport } from './transports';

const logger = Logger.create({ namespace: 'postor-mailer' });

function formatRecipient(recipient: EmailRecipient): string {
  if (typeof recipient === 'string') {
    return recipient;
  }
  return recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email;
}

function formatRecipients(recipients: EmailRecipient | EmailRecipient[]): string {
  const array = Array.isArray(recipients) ? recipients : [recipients];
  return array.map(formatRecipient).join(', ');
}

export class EmailClient {
  private transporter: EmailTransporter;
  private defaults: EmailClientConfig['defaults'];

  constructor(config: EmailClientConfig) {
    this.transporter = createTransport(config.transport);
    this.defaults = config.defaults;
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    const from = options.from ?? this.defaults?.from;
    const replyTo = options.replyTo ?? this.defaults?.replyTo;

    if (!from) {
      throw new Error('Email "from" address is required');
    }

    if (!options.text && !options.html) {
      throw new Error('Email must have either text or html content');
    }

    const to = formatRecipients(options.to);
    const cc = options.cc ? formatRecipients(options.cc) : undefined;
    const bcc = options.bcc ? formatRecipients(options.bcc) : undefined;

    logger.info(
      {
        to,
        subject: options.subject,
        hasText: !!options.text,
        hasHtml: !!options.html,
        attachments: options.attachments?.length ?? 0,
      },
      'Sending email'
    );

    try {
      const info = await this.transporter.sendMail({
        from: formatRecipient(from),
        to,
        cc,
        bcc,
        replyTo: replyTo ? formatRecipient(replyTo) : undefined,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
        headers: options.headers,
      });

      logger.info(
        {
          messageId: info.messageId,
          accepted: info.accepted,
          rejected: info.rejected,
        },
        'Email sent successfully'
      );

      return {
        messageId: info.messageId,
        accepted: info.accepted as string[],
        rejected: info.rejected as string[],
        response: info.response,
      };
    } catch (error) {
      logger.error(
        {
          error,
          to,
          subject: options.subject,
        },
        'Failed to send email'
      );
      throw error;
    }
  }

  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('Email transport verified successfully');
      return true;
    } catch (error) {
      logger.error({ error }, 'Email transport verification failed');
      return false;
    }
  }

  async close(): Promise<void> {
    this.transporter.close();
    logger.info('Email transport closed');
  }
}
```

### Main Export (`src/index.ts`)

```typescript
export { EmailClient } from './client';
export { createTransport } from './transports';
export type {
  EmailAddress,
  EmailAttachment,
  EmailClientConfig,
  EmailRecipient,
  EmailTransporter,
  SendEmailOptions,
  SendEmailResult,
  SendGridConfig,
  SesConfig,
  SmtpConfig,
  TransportConfig,
} from './types';
```

## Usage Examples

### Basic SMTP Configuration

```typescript
import { EmailClient } from '@eventuras/postor-mailer';

const emailClient = new EmailClient({
  transport: {
    type: 'smtp',
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT!, 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  },
  defaults: {
    from: {
      name: 'Eventuras',
      email: 'noreply@eventuras.com',
    },
  },
});

// Send email with HTML (pre-rendered from template library)
await emailClient.send({
  to: 'user@example.com',
  subject: 'Event Registration Confirmed',
  html: renderedHtml, // From Handlebars template library
  text: 'Event Registration Confirmed...', // Plain text version
});
```

### SendGrid Configuration

```typescript
const emailClient = new EmailClient({
  transport: {
    type: 'sendgrid',
    apiKey: process.env.SENDGRID_API_KEY!,
  },
  defaults: {
    from: 'Eventuras <noreply@eventuras.com>',
  },
});
```

### Next.js Server Action

```typescript
'use server';

import { EmailClient } from '@eventuras/postor-mailer';
import { actionError, actionSuccess } from '@eventuras/core-nextjs/actions';
// Future: import { renderEventConfirmation } from '@eventuras/email-templates';

let emailClient: EmailClient | null = null;

function getEmailClient() {
  if (!emailClient) {
    emailClient = new EmailClient({
      transport: {
        type: 'smtp',
        host: process.env.SMTP_HOST!,
        port: parseInt(process.env.SMTP_PORT!, 10),
        auth: {
          user: process.env.SMTP_USER!,
          pass: process.env.SMTP_PASS!,
        },
      },
      defaults: {
        from: 'Eventuras <noreply@eventuras.com>',
      },
    });
  }
  return emailClient;
}

export async function sendEventConfirmationEmail(userId: string, eventId: number) {
  try {
    const client = getEmailClient();
    
    // Future: const html = await renderEventConfirmation({ user, event });
    const html = '<p>Your registration is confirmed!</p>'; // Temporary

    await client.send({
      to: user.email,
      subject: 'Event Registration Confirmed',
      html,
      text: 'Your registration is confirmed!',
    });

    return actionSuccess(undefined, 'Email sent successfully');
  } catch (error) {
    return actionError('Failed to send email');
  }
}
```

### With Multiple Recipients and Attachments

```typescript
await emailClient.send({
  to: [
    'user1@example.com',
    { name: 'John Doe', email: 'user2@example.com' },
  ],
  cc: 'admin@eventuras.com',
  subject: 'Event Certificate',
  html: certificateHtml,
  attachments: [
    {
      filename: 'certificate.pdf',
      path: '/path/to/certificate.pdf',
      contentType: 'application/pdf',
    },
  ],
});
```

## Testing

### Unit Tests (`src/__tests__/client.test.ts`)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailClient } from '../client';
import type { EmailClientConfig } from '../types';

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({
        messageId: 'test-message-id',
        accepted: ['user@example.com'],
        rejected: [],
        response: '250 OK',
      }),
      verify: vi.fn().mockResolvedValue(true),
      close: vi.fn(),
    })),
  },
}));

describe('EmailClient', () => {
  let emailClient: EmailClient;
  let config: EmailClientConfig;

  beforeEach(() => {
    config = {
      transport: {
        type: 'smtp',
        host: 'smtp.example.com',
        port: 587,
        auth: {
          user: 'test@example.com',
          pass: 'password',
        },
      },
      defaults: {
        from: 'Test <test@example.com>',
      },
    };
    emailClient = new EmailClient(config);
  });

  it('should send email successfully', async () => {
    const result = await emailClient.send({
      to: 'user@example.com',
      subject: 'Test Email',
      html: '<p>Test content</p>',
    });

    expect(result.messageId).toBe('test-message-id');
    expect(result.accepted).toContain('user@example.com');
    expect(result.rejected).toHaveLength(0);
  });

  it('should throw error when no content provided', async () => {
    await expect(
      emailClient.send({
        to: 'user@example.com',
        subject: 'Test Email',
      })
    ).rejects.toThrow('Email must have either text or html content');
  });

  it('should verify transport', async () => {
    const result = await emailClient.verify();
    expect(result).toBe(true);
  });
});
```

### Integration Test Example

```typescript
import { EmailClient } from '@eventuras/postor-mailer';

// Use Ethereal for testing (creates temporary SMTP account)
// https://ethereal.email/
const testAccount = await nodemailer.createTestAccount();

const emailClient = new EmailClient({
  transport: {
    type: 'smtp',
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  },
  defaults: {
    from: 'Test <test@example.com>',
  },
});

const result = await emailClient.send({
  to: 'user@example.com',
  subject: 'Test Email',
  html: '<p>Test content</p>',
});

console.log('Preview URL:', nodemailer.getTestMessageUrl(result));
```

## Environment Variables

```bash
# .env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM_NAME=Eventuras
SMTP_FROM_EMAIL=noreply@eventuras.com

# Or for SendGrid
SENDGRID_API_KEY=your-api-key
```

## Configuration Examples

### Development (Mock)

```typescript
// Create a mock transport that logs emails
const emailClient = new EmailClient({
  transport: {
    type: 'smtp',
    host: 'localhost',
    port: 1025, // MailHog or similar
  },
  defaults: {
    from: 'Dev <dev@localhost>',
  },
});
```

### Production (SendGrid)

```typescript
const emailClient = new EmailClient({
  transport: {
    type: 'sendgrid',
    apiKey: process.env.SENDGRID_API_KEY!,
  },
  defaults: {
    from: 'Eventuras <noreply@eventuras.com>',
    replyTo: 'support@eventuras.com',
  },
});
```

## Integration with Future Template Library

Once the Handlebars-based template library is created, the integration will look like this:

```typescript
import { EmailClient } from '@eventuras/postor-mailer';
import { renderTemplate } from '@eventuras/email-templates'; // Future library

const emailClient = new EmailClient({ /* config */ });

// Render template with data
const { html, text } = await renderTemplate('event-confirmation', {
  userName: 'John Doe',
  eventName: 'Summer Conference 2025',
  eventDate: '2025-06-15',
});

// Send email with rendered content
await emailClient.send({
  to: 'user@example.com',
  subject: 'Event Registration Confirmed',
  html,
  text,
});
```

## Error Handling

```typescript
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'email-service' });

try {
  await emailClient.send({
    to: user.email,
    subject: 'Welcome',
    html: welcomeHtml,
  });
} catch (error) {
  if (error instanceof Error) {
    logger.error({ error, userEmail: user.email }, 'Failed to send welcome email');
    
    // Handle specific errors
    if (error.message.includes('Invalid recipient')) {
      // Handle invalid email
    } else if (error.message.includes('Connection timeout')) {
      // Handle timeout
    }
  }
  
  // Re-throw or handle gracefully
  throw error;
}
```

## Performance Considerations

### Connection Pooling

Nodemailer automatically pools SMTP connections when `pool: true` (default in our implementation). This reuses connections for better performance.

### Rate Limiting

For bulk emails, implement rate limiting at the application level:

```typescript
import pLimit from 'p-limit';

const limit = pLimit(5); // Max 5 concurrent emails

const results = await Promise.all(
  users.map(user =>
    limit(() =>
      emailClient.send({
        to: user.email,
        subject: 'Newsletter',
        html: newsletterHtml,
      })
    )
  )
);
```

## Security Best Practices

1. **Never commit credentials**: Use environment variables
2. **Use TLS/SSL**: Enable `secure: true` for port 465
3. **Validate recipients**: Check email format before sending
4. **Sanitize HTML**: If accepting user input in emails
5. **Rate limiting**: Prevent abuse
6. **Monitor failures**: Track and alert on high failure rates

## Monitoring and Logging

All operations are logged via `@eventuras/logger`:

- Info level: Successful sends, transport verification
- Error level: Failed sends, connection issues

Example log output:
```json
{
  "level": "info",
  "namespace": "postor-mailer",
  "to": "user@example.com",
  "subject": "Event Registration",
  "hasHtml": true,
  "hasText": true,
  "msg": "Sending email"
}
```

## Migration from C# Email Service

The C# backend currently uses `Losol.Communication.Email`. This library can coexist:

- **C# services**: Continue using existing email infrastructure
- **Node.js services**: Use postor-mailer for apps/web, apps/historia, apps/convertoapi
- **Shared SMTP**: Both can use the same SMTP server

## Roadmap

### Phase 1: Core Implementation (Week 1)
- [x] Package setup
- [x] Type definitions
- [x] SMTP transport
- [x] SendGrid transport
- [x] Basic email client
- [x] Unit tests

### Phase 2: Testing & Refinement (Week 2)
- [ ] Integration tests
- [ ] Mock transport for testing
- [ ] Ethereal.email integration
- [ ] Error handling improvements
- [ ] Documentation

### Phase 3: Production Readiness (Week 3)
- [ ] Connection pooling optimization
- [ ] Retry logic
- [ ] Metrics collection
- [ ] Performance testing
- [ ] Production deployment

### Future: Template Library
- [ ] Separate Handlebars-based template library
- [ ] Pre-built email templates
- [ ] Template preview tool
- [ ] Internationalization support

## Comparison: Postor-Mailer vs Resend

| Feature | Postor-Mailer | Resend |
|---------|---------------|--------|
| **Cost** | Free (SMTP costs only) | $20/month (50k emails) |
| **Control** | Full control | Managed service |
| **Setup** | More configuration | Minimal setup |
| **Templating** | External (Handlebars) | Built-in (React Email) |
| **Deliverability** | DIY (SMTP config) | Built-in (managed) |
| **Vendor Lock-in** | None | Yes |
| **TypeScript** | ✅ | ✅ |
| **Flexibility** | ✅ High | Limited |

## Conclusion

Postor-mailer provides a lightweight, flexible email sending solution for Eventuras using Nodemailer. By separating email delivery from templating, it allows for:

- **Flexibility**: Use any template engine (Handlebars coming next)
- **Control**: Full control over transport and configuration
- **Cost**: No additional service costs (only SMTP infrastructure)
- **Type Safety**: Full TypeScript support
- **Integration**: Works seamlessly across the monorepo

The library focuses solely on reliable email delivery, leaving templating to specialized libraries that can be easily swapped or upgraded independently.

## Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Nodemailer Plugins](https://nodemailer.com/plugins/)
- [SMTP Configuration Guide](https://nodemailer.com/smtp/)
- [Ethereal Email Testing](https://ethereal.email/)
