# @eventuras/mailer

Email transport layer for Eventuras applications.

## Features

- **Development mode**: Logs emails to console (no SMTP needed)
- **Production mode**: Sends via SMTP using Nodemailer
- **TypeScript**: Full type safety
- **Transport-focused**: Handles email delivery, not templating

> **Note**: For email templates, use [`@eventuras/notitia-templates`](../notitia-templates/README.md)

## Installation

```bash
pnpm add @eventuras/mailer
```

## Usage

### Basic Usage

```typescript
import { Mailer } from '@eventuras/mailer';

const mailer = new Mailer({
  mode: 'development', // or 'production'
  from: {
    email: 'noreply@eventuras.com',
    name: 'Eventuras',
  },
  smtp: {
    // Only required in production mode
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: {
      user: 'your-user',
      pass: 'your-password',
    },
  },
});

await mailer.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome',
  html: '<h1>Hello!</h1>',
});
```

### Using Environment Variables

```typescript
import { createMailerFromEnv } from '@eventuras/mailer';

// Reads from environment variables:
// - NODE_ENV (development/production)
// - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
// - SMTP_SECURE (optional, default: false)
// - SMTP_FROM_EMAIL, SMTP_FROM_NAME (optional)

const mailer = createMailerFromEnv();
await mailer.sendEmail({ ... });
```

### With Notitia Templates

```typescript
import { Mailer } from '@eventuras/mailer';
import { createNotitiaTemplates } from '@eventuras/notitia-templates';

const mailer = new Mailer({ mode: 'development' });
const notitia = createNotitiaTemplates('nb-NO');

// Render template with Notitia
const html = notitia.render('email', 'otp-login', {
  code: '123456',
  expiresInMinutes: 10,
});

const subject = notitia.getSubject('email', 'otp-login', {
  code: '123456',
});

// Send with Mailer
await mailer.sendEmail({
  to: 'user@example.com',
  subject,
  html,
});
```

## Environment Variables

- `NODE_ENV` - `development` or `production`
- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port (e.g., 587)
- `SMTP_SECURE` - Use TLS/SSL (`true` or `false`)
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `SMTP_FROM_EMAIL` - Default sender email
- `SMTP_FROM_NAME` - Default sender name

## Development Mode

In development mode, emails are logged to console with formatted output:

```
📧 Email (Development Mode - Not Sent)
────────────────────────────────────────────────────────────
From: Eventuras <noreply@eventuras.com>
To: user@example.com
Subject: Your login code
────────────────────────────────────────────────────────────
HTML Content:
<!DOCTYPE html>
...
────────────────────────────────────────────────────────────
```

No SMTP configuration is required in development mode.

## License

MIT
