# Postor-Mailer Specification

**Version**: 1.0  
**Library**: `@eventuras/postor-mailer`  
**Primary Consumer**: `apps/historia` (Next.js/PayloadCMS)

## Overview

Postor-mailer is a lightweight TypeScript wrapper around Nodemailer for sending emails. It provides a simple, type-safe interface for email delivery **without** built-in templating. Template rendering will be handled by separate libraries.

### Design Goals

- **Simple API**: Easy to use, minimal configuration
- **Type Safety**: Full TypeScript support with clear interfaces
- **Transport Flexibility**: Support SMTP, SendGrid, and AWS SES
- **No Templating**: Accepts pre-rendered HTML/text content
- **Logging**: Integrated with `@eventuras/logger`
- **Testing**: Easy to mock and test

## Architecture

```
libs/postor-mailer/
  ├── src/
  │   ├── index.ts           # Public exports
  │   ├── client.ts          # EmailClient class
  │   ├── transports.ts      # Transport factory
  │   └── types.ts           # TypeScript interfaces
  ├── package.json
  └── tsconfig.json
```

## Core Interfaces

### Email Client Configuration

```typescript
interface EmailClientConfig {
  transport: SmtpConfig | SendGridConfig | SesConfig;
  defaults?: {
    from?: string;
    replyTo?: string;
  };
}

interface SmtpConfig {
  type: 'smtp';
  host: string;
  port: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
}

interface SendGridConfig {
  type: 'sendgrid';
  apiKey: string;
}

interface SesConfig {
  type: 'ses';
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}
```

### Sending Emails

```typescript
interface SendEmailOptions {
  to: string | EmailAddress | Array<string | EmailAddress>;
  subject: string;
  html?: string;
  text?: string;
  from?: string | EmailAddress;
  replyTo?: string | EmailAddress;
  cc?: string | EmailAddress | Array<string | EmailAddress>;
  bcc?: string | EmailAddress | Array<string | EmailAddress>;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
}

interface EmailAddress {
  email: string;
  name?: string;
}

interface EmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
}

interface SendEmailResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
}
```

## Usage Examples

### Basic Setup (Historia)

```typescript
// apps/historia/src/lib/email.ts
import { EmailClient } from '@eventuras/postor-mailer';

export const emailClient = new EmailClient({
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
    from: 'Historia <noreply@eventuras.com>',
  },
});
```

### Sending a Simple Email

```typescript
import { emailClient } from '@/lib/email';

await emailClient.send({
  to: 'user@example.com',
  subject: 'Order Confirmation',
  html: '<h1>Thank you for your order!</h1><p>Your order #12345 has been confirmed.</p>',
  text: 'Thank you for your order! Your order #12345 has been confirmed.',
});
```

### With Structured Recipients

```typescript
await emailClient.send({
  to: { name: 'John Doe', email: 'john@example.com' },
  cc: [
    'admin@example.com',
    { name: 'Support', email: 'support@example.com' },
  ],
  subject: 'Important Update',
  html: renderedHtml,
});
```

### With Attachments

```typescript
await emailClient.send({
  to: 'customer@example.com',
  subject: 'Your Invoice',
  html: '<p>Please find your invoice attached.</p>',
  attachments: [
    {
      filename: 'invoice.pdf',
      path: '/path/to/invoice.pdf',
      contentType: 'application/pdf',
    },
  ],
});
```

### In Next.js Server Actions

```typescript
'use server';

import { emailClient } from '@/lib/email';
import { actionError, actionSuccess } from '@eventuras/core-nextjs/actions';

export async function sendOrderConfirmation(orderId: string) {
  try {
    // Render email content (from template library)
    const { html, text } = await renderOrderConfirmationEmail(orderId);

    await emailClient.send({
      to: order.customerEmail,
      subject: 'Order Confirmation',
      html,
      text,
    });

    return actionSuccess(undefined, 'Confirmation email sent');
  } catch (error) {
    return actionError('Failed to send email');
  }
}
```

## Implementation Details

### EmailClient Class

```typescript
export class EmailClient {
  constructor(config: EmailClientConfig);
  
  /**
   * Send an email
   * @throws Error if email fails to send
   */
  async send(options: SendEmailOptions): Promise<SendEmailResult>;
  
  /**
   * Verify the transport connection
   * @returns true if connection is successful
   */
  async verify(): Promise<boolean>;
  
  /**
   * Close the transport connection
   */
  async close(): Promise<void>;
}
```

### Transport Factory

```typescript
function createTransport(config: TransportConfig): Transporter;
```

Handles creation of Nodemailer transports based on configuration type.

## Configuration

### Environment Variables (Historia)

```bash
# .env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM_EMAIL=noreply@eventuras.com
SMTP_FROM_NAME=Historia
```

### SendGrid Alternative

```bash
SENDGRID_API_KEY=your-sendgrid-api-key
```

```typescript
const emailClient = new EmailClient({
  transport: {
    type: 'sendgrid',
    apiKey: process.env.SENDGRID_API_KEY!,
  },
  defaults: {
    from: 'Historia <noreply@eventuras.com>',
  },
});
```

## Error Handling

```typescript
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'email' });

try {
  await emailClient.send({
    to: user.email,
    subject: 'Welcome',
    html: welcomeHtml,
  });
} catch (error) {
  logger.error({ error, userEmail: user.email }, 'Failed to send email');
  
  // Handle specific errors
  if (error.message.includes('Invalid recipient')) {
    // Invalid email address
  } else if (error.message.includes('Connection timeout')) {
    // SMTP timeout
  }
  
  throw error;
}
```

## Testing

### Mock Transport for Testing

```typescript
import { vi } from 'vitest';

vi.mock('@eventuras/postor-mailer', () => ({
  EmailClient: vi.fn().mockImplementation(() => ({
    send: vi.fn().mockResolvedValue({
      messageId: 'test-id',
      accepted: ['test@example.com'],
      rejected: [],
    }),
    verify: vi.fn().mockResolvedValue(true),
    close: vi.fn(),
  })),
}));
```

### Integration Testing with Ethereal

```typescript
// Test account from ethereal.email
const testAccount = {
  user: 'test.user@ethereal.email',
  pass: 'test-password',
};

const emailClient = new EmailClient({
  transport: {
    type: 'smtp',
    host: 'smtp.ethereal.email',
    port: 587,
    auth: testAccount,
  },
});

const result = await emailClient.send({
  to: 'recipient@example.com',
  subject: 'Test',
  html: '<p>Test email</p>',
});

console.log('Preview:', `https://ethereal.email/message/${result.messageId}`);
```

## Dependencies

```json
{
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

## Integration with Historia

### Setup

1. Add postor-mailer to Historia dependencies:

```json
{
  "dependencies": {
    "@eventuras/postor-mailer": "workspace:*"
  }
}
```

2. Create email client instance:

```typescript
// apps/historia/src/lib/email.ts
import { EmailClient } from '@eventuras/postor-mailer';
import { config } from '@/config.server';

export const emailClient = new EmailClient({
  transport: {
    type: 'smtp',
    host: config.smtp.host,
    port: config.smtp.port,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  },
  defaults: {
    from: `${config.smtp.fromName} <${config.smtp.fromEmail}>`,
  },
});
```

3. Use in server actions or API routes:

```typescript
import { emailClient } from '@/lib/email';

// In server action
export async function sendNotification(email: string, message: string) {
  await emailClient.send({
    to: email,
    subject: 'Notification',
    html: message,
  });
}
```

### PayloadCMS Integration

PayloadCMS already uses `@payloadcms/email-nodemailer` for system emails. Postor-mailer can be used for custom transactional emails outside of PayloadCMS's built-in email system.

## Performance Considerations

### Connection Pooling

Nodemailer automatically pools SMTP connections (enabled by default in our implementation):

- **pool**: `true` (reuse connections)
- **maxConnections**: `5` (max concurrent connections)
- **maxMessages**: `100` (messages per connection)

### Rate Limiting

For bulk emails, implement rate limiting:

```typescript
import pLimit from 'p-limit';

const limit = pLimit(5); // Max 5 concurrent sends

await Promise.all(
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

1. **Environment Variables**: Never commit SMTP credentials
2. **TLS/SSL**: Use `secure: true` for port 465
3. **Email Validation**: Validate email addresses before sending
4. **Content Sanitization**: Sanitize user-generated content in emails
5. **Rate Limiting**: Prevent abuse with rate limits

## Logging

All operations are logged via `@eventuras/logger`:

```typescript
// Success
logger.info({ to, messageId }, 'Email sent successfully');

// Error
logger.error({ error, to, subject }, 'Failed to send email');
```

## Future Enhancements

- **Queue Support**: Integration with Bull/BullMQ for async processing
- **Retry Logic**: Automatic retry with exponential backoff
- **Metrics**: Track send rates, failures, and delivery times
- **AWS SES Transport**: Full implementation for SES
- **Template Library**: Separate Handlebars-based template rendering

## Summary

Postor-mailer provides a simple, type-safe wrapper around Nodemailer specifically designed for Historia and other TypeScript applications in the Eventuras monorepo. It focuses solely on email delivery, leaving template rendering to specialized libraries.

**Key Features**:
- ✅ Simple, intuitive API
- ✅ Full TypeScript support
- ✅ Multiple transport options
- ✅ No templating (separation of concerns)
- ✅ Easy to test and mock
- ✅ Integrated logging
- ✅ Production-ready

**Quick Start**:
```typescript
import { EmailClient } from '@eventuras/postor-mailer';

const client = new EmailClient({
  transport: { type: 'smtp', host: '...', port: 587, auth: {...} },
  defaults: { from: 'Historia <noreply@eventuras.com>' }
});

await client.send({
  to: 'user@example.com',
  subject: 'Hello',
  html: '<p>Hello from Historia!</p>'
});
```
