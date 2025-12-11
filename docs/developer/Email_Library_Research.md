# Node.js Email Library Research for Eventuras

**Date**: December 2025  
**Purpose**: Evaluate Node.js email libraries for creating a new email sending library in the Eventuras monorepo

## Executive Summary

This document provides research and recommendations for implementing a Node.js-based email library for Eventuras. The current backend (C#) uses SMTP and SendGrid, but there's a need for a TypeScript/Node.js email solution that can be used across the monorepo's TypeScript applications (web, historia, convertoapi).

## Current Email Implementation

Eventuras currently has:

1. **C# Backend Email** (`apps/api/src/Losol.Communication.Email/`)
   - SMTP support via `SmtpEmailSender.cs`
   - SendGrid integration via `SendGridEmailSender.cs`
   - Mock implementation for testing
   - File-based email writer for development

2. **Existing TypeScript Email Code** (`libs/google-api/`)
   - Gmail API integration for OAuth-based email sending
   - Used primarily for E2E testing (waiting for verification emails)
   - Dependencies: `googleapis` (v167), `google-auth-library` (v10.5)

## Requirements Analysis

Based on the Eventuras architecture, a new Node.js email library should:

1. **Integration**: Work seamlessly with Next.js (apps/web, apps/historia) and Node.js (convertoapi)
2. **Developer Experience**: TypeScript-first with excellent type safety
3. **Flexibility**: Support multiple email providers (SMTP, API-based)
4. **Templates**: Modern template system compatible with React/JSX
5. **Testing**: Easy mocking and testing capabilities
6. **Monorepo**: Publishable as a shared library in `libs/`
7. **Cost**: Free tier or cost-effective for transactional emails
8. **Reliability**: High deliverability and good reputation management

## Library Comparison

### 1. Nodemailer (Industry Standard)

**Overview**: The most popular Node.js email library (21M+ weekly downloads)

**Pros**:
- ✅ Zero dependencies, battle-tested, open source
- ✅ Multiple transport options (SMTP, SendGrid, SES, etc.)
- ✅ Excellent plugin ecosystem
- ✅ Full control over email sending
- ✅ Supports attachments, HTML emails, custom headers
- ✅ OAuth2, DKIM, TLS support
- ✅ Works with template engines (Handlebars, Pug, MJML)
- ✅ Free and self-hosted

**Cons**:
- ❌ Direct SMTP can be slower
- ❌ No built-in analytics or tracking
- ❌ Manual queue management needed for bulk emails
- ❌ Requires SMTP configuration and maintenance
- ❌ Traditional API (not as modern as newer alternatives)

**Best For**: Full control, custom workflows, on-premise SMTP

**Example**:
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: 'user@example.com',
    pass: 'password'
  }
});

await transporter.sendMail({
  from: '"Eventuras" <noreply@eventuras.com>',
  to: 'user@example.com',
  subject: 'Event Registration Confirmed',
  html: '<p>Thank you for registering!</p>'
});
```

**Dependencies**: Zero runtime dependencies

---

### 2. Resend (Modern Developer-First)

**Overview**: Modern email API with React-first approach (launched 2023, rapidly growing)

**Pros**:
- ✅ Excellent developer experience (TypeScript-native)
- ✅ React Email integration (JSX email templates)
- ✅ Simple, intuitive API
- ✅ Built-in deliverability features (SPF, DKIM, DMARC, BIMI)
- ✅ Real-time webhooks and analytics
- ✅ Generous free tier (3,000 emails/month)
- ✅ Fast setup (emails sent in minutes)
- ✅ Test mode for development
- ✅ GDPR/SOC2 compliant
- ✅ Global infrastructure
- ✅ Excellent documentation

**Cons**:
- ❌ Requires external service (API dependency)
- ❌ Vendor lock-in
- ❌ Short log retention (1-7 days depending on plan)
- ❌ Rate limits (2 requests/second on free tier)
- ❌ Newer platform (less enterprise case studies)

**Best For**: Modern TypeScript/React projects, quick setup, good deliverability

**Pricing** (2025):
- **Free**: 3,000 transactional emails/month, 1,000 marketing contacts
- **Pro**: $20/month (50,000 emails)
- **Scale**: $90/month (100,000 emails)
- **Enterprise**: Custom

**Example**:
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Eventuras <onboarding@eventuras.com>',
  to: 'user@example.com',
  subject: 'Event Registration Confirmed',
  html: '<p>Thank you for registering!</p>'
});
```

**With React Email**:
```tsx
import { Resend } from 'resend';
import { EmailTemplate } from './EmailTemplate';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Eventuras <onboarding@eventuras.com>',
  to: 'user@example.com',
  subject: 'Event Registration Confirmed',
  react: <EmailTemplate name="John" eventName="Summer Conference" />
});
```

**Dependencies**: `resend` (0 peer dependencies)

---

### 3. React Email (Template Engine)

**Overview**: Modern email template system using React components (created by Resend team)

**Pros**:
- ✅ Write email templates in React/JSX
- ✅ Component-based, reusable design
- ✅ Live preview in development
- ✅ TypeScript support
- ✅ Responsive by default
- ✅ Works with any email sender (Nodemailer, Resend, SendGrid, etc.)
- ✅ Version control friendly
- ✅ Built-in components (Button, Link, Section, etc.)

**Cons**:
- ❌ Requires build step
- ❌ Learning curve for non-React teams

**Best For**: React projects needing maintainable email templates

**Example**:
```tsx
// emails/EventConfirmation.tsx
import { Html, Head, Body, Container, Button } from '@react-email/components';

export function EventConfirmation({ eventName, userName }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc' }}>
        <Container>
          <h1>Event Registration Confirmed</h1>
          <p>Hello {userName},</p>
          <p>You're registered for {eventName}!</p>
          <Button href="https://eventuras.com/events">View Event</Button>
        </Container>
      </Body>
    </Html>
  );
}
```

**Usage with Nodemailer**:
```typescript
import { render } from '@react-email/render';
import { EventConfirmation } from './emails/EventConfirmation';

const html = render(<EventConfirmation eventName="..." userName="..." />);

await transporter.sendMail({
  from: '...',
  to: '...',
  subject: '...',
  html
});
```

**Dependencies**: `@react-email/components`, `@react-email/render`

---

### 4. API-Based Services

**SendGrid** (Currently used in C# backend):
- ✅ Highly scalable, excellent analytics
- ✅ Template editor, A/B testing
- ❌ Complex pricing, potential vendor lock-in
- ❌ API can be verbose

**Mailgun**:
- ✅ Powerful APIs, excellent for both transactional and bulk
- ✅ Event webhooks, detailed analytics
- ❌ Pricing can add up
- ❌ Best features on paid tiers

**Amazon SES**:
- ✅ Very low cost ($0.10 per 1,000 emails)
- ✅ Integrates with AWS ecosystem
- ❌ Complex setup (IAM, sender verification)
- ❌ Basic analytics

---

## Recommended Solution for Eventuras

### Primary Recommendation: **Resend + React Email**

**Rationale**:

1. **Perfect for Eventuras Tech Stack**:
   - TypeScript-first (matches apps/web, apps/historia)
   - React Email templates align with existing React expertise
   - Works seamlessly with Next.js server actions

2. **Developer Experience**:
   - Fast setup and iteration
   - Type-safe API
   - Modern, intuitive design
   - Excellent documentation

3. **Cost Effective**:
   - Free tier (3,000 emails/month) sufficient for development and small deployments
   - Predictable pricing for production

4. **Deliverability**:
   - Built-in authentication (SPF, DKIM, DMARC)
   - Managed infrastructure
   - High inbox placement rates

5. **Eventuras Benefits**:
   - Share email templates across web and historia
   - Version control email templates (no external template editor needed)
   - Easy testing with test mode
   - Webhooks for delivery tracking

**Implementation Path**:

```
libs/
  email/                          # New shared library
    src/
      index.ts                    # Main exports
      client.ts                   # Resend client setup
      types.ts                    # TypeScript types
    templates/                    # React Email templates
      EventRegistration.tsx
      EventReminder.tsx
      PasswordReset.tsx
      shared/                     # Shared components
        Layout.tsx
        Button.tsx
        Header.tsx
        Footer.tsx
```

### Secondary Recommendation: **Nodemailer + React Email**

**For cases where**:
- Full control is required
- No external API dependencies allowed
- Existing SMTP infrastructure must be used
- Cost must be absolutely minimized

**Hybrid Approach**:
- Use React Email for templates (same as primary)
- Use Nodemailer as the transport layer
- Swap transport based on environment (Resend for cloud, SMTP for on-premise)

---

## Implementation Plan

### Phase 1: Library Setup (Week 1)

1. **Create Package**:
   ```bash
   mkdir -p libs/email
   cd libs/email
   pnpm init
   ```

2. **Install Dependencies**:
   ```bash
   pnpm add resend @react-email/components @react-email/render
   pnpm add -D typescript @eventuras/typescript-config
   ```

3. **Package Structure**:
   ```json
   {
     "name": "@eventuras/email",
     "version": "0.1.0",
     "type": "module",
     "main": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "exports": {
       ".": "./dist/index.js",
       "./templates": "./dist/templates/index.js"
     }
   }
   ```

### Phase 2: Core Implementation (Week 1-2)

1. **Email Client**:
```typescript
// libs/email/src/client.ts
import { Resend } from 'resend';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'email' });

export interface EmailClientConfig {
  apiKey: string;
  fromAddress: string;
  fromName: string;
}

export function createEmailClient(config: EmailClientConfig) {
  const resend = new Resend(config.apiKey);
  
  return {
    async send(options: SendEmailOptions) {
      logger.info({ to: options.to }, 'Sending email');
      
      try {
        const result = await resend.emails.send({
          from: `${config.fromName} <${config.fromAddress}>`,
          to: options.to,
          subject: options.subject,
          react: options.template,
          html: options.html,
        });
        
        logger.info({ id: result.data?.id }, 'Email sent successfully');
        return result;
      } catch (error) {
        logger.error({ error }, 'Failed to send email');
        throw error;
      }
    }
  };
}
```

2. **Template Base**:
```tsx
// libs/email/templates/shared/Layout.tsx
import { Html, Head, Body, Container } from '@react-email/components';

export function EmailLayout({ children }: { children: React.ReactNode }) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          {children}
        </Container>
      </Body>
    </Html>
  );
}
```

3. **Example Template**:
```tsx
// libs/email/templates/EventRegistration.tsx
import { EmailLayout } from './shared/Layout';
import { Button, Text, Heading } from '@react-email/components';

interface Props {
  userName: string;
  eventName: string;
  eventDate: string;
  eventUrl: string;
}

export function EventRegistrationEmail({ userName, eventName, eventDate, eventUrl }: Props) {
  return (
    <EmailLayout>
      <Heading>Event Registration Confirmed</Heading>
      <Text>Hello {userName},</Text>
      <Text>
        You're successfully registered for <strong>{eventName}</strong> on {eventDate}.
      </Text>
      <Button href={eventUrl} style={{ backgroundColor: '#0070f3', color: '#fff' }}>
        View Event Details
      </Button>
    </EmailLayout>
  );
}
```

### Phase 3: Integration (Week 2)

1. **Server Actions** (apps/web):
```typescript
'use server';

import { createEmailClient } from '@eventuras/email';
import { EventRegistrationEmail } from '@eventuras/email/templates';

export async function sendRegistrationEmail(userId: string, eventId: number) {
  const emailClient = createEmailClient({
    apiKey: process.env.RESEND_API_KEY!,
    fromAddress: 'noreply@eventuras.com',
    fromName: 'Eventuras'
  });

  await emailClient.send({
    to: user.email,
    subject: 'Event Registration Confirmed',
    template: <EventRegistrationEmail {...data} />
  });
}
```

2. **Testing Setup**:
```typescript
// libs/email/src/__tests__/client.test.ts
import { vi } from 'vitest';
import { createEmailClient } from '../client';

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: 'test-id' } })
    }
  }))
}));

describe('EmailClient', () => {
  it('should send email successfully', async () => {
    const client = createEmailClient({
      apiKey: 'test-key',
      fromAddress: 'test@example.com',
      fromName: 'Test'
    });

    const result = await client.send({
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>Test</p>'
    });

    expect(result.data?.id).toBe('test-id');
  });
});
```

### Phase 4: Documentation & Migration (Week 3)

1. Create README.md with usage examples
2. Document environment variables
3. Add migration guide from C# email service
4. Create example templates for common use cases

---

## Alternative Scenarios

### Scenario A: Full Control Required

**Use**: Nodemailer + React Email

```typescript
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const html = render(<EventRegistrationEmail {...props} />);

await transporter.sendMail({
  from: 'Eventuras <noreply@eventuras.com>',
  to: user.email,
  subject: 'Event Registration',
  html
});
```

### Scenario B: Existing Gmail Integration

**Use**: Existing `@eventuras/google-api`

Already implemented for E2E tests. Could be extended for production use if Gmail is the preferred provider.

---

## Security Considerations

1. **API Keys**: Store in environment variables, never commit
2. **Rate Limiting**: Implement in application layer
3. **Email Validation**: Validate recipient addresses
4. **Spam Prevention**: Use proper authentication (SPF, DKIM, DMARC)
5. **Content Security**: Sanitize user-generated content in emails
6. **Privacy**: Comply with GDPR for email communications

---

## Testing Strategy

1. **Unit Tests**: Test email client logic
2. **Template Tests**: Render tests for React Email templates
3. **Integration Tests**: Use Resend test mode or mock API
4. **E2E Tests**: Use existing Gmail integration to verify delivery

---

## Cost Analysis

### Resend Free Tier
- 3,000 emails/month
- Suitable for:
  - Development environments
  - Small to medium event platforms
  - Testing and staging

### Resend Pro ($20/month)
- 50,000 emails/month = $0.0004 per email
- Suitable for:
  - Production deployments
  - ~1,600 emails/day
  - Medium-sized event platforms

### Nodemailer (Self-hosted SMTP)
- Infrastructure costs only
- Requires:
  - SMTP server maintenance
  - IP reputation management
  - Deliverability monitoring

---

## Conclusion

**Recommended**: Implement **Resend + React Email** as the primary solution for Eventuras.

**Key Benefits**:
1. Modern, TypeScript-first developer experience
2. Aligns perfectly with existing React/Next.js stack
3. Excellent deliverability out of the box
4. Cost-effective with generous free tier
5. Version-controlled email templates
6. Easy testing and iteration
7. Scalable pricing model

**Next Steps**:
1. Create `libs/email` package
2. Install Resend and React Email dependencies
3. Implement core email client
4. Create shared email layout components
5. Migrate existing email templates to React Email
6. Integrate with apps/web server actions
7. Add comprehensive tests
8. Document usage patterns

---

## References

- [Resend Official Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email/)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Email Best Practices - Mailtrap](https://mailtrap.io/blog/send-emails-with-nodejs/)
- [Developer Email Platforms 2025 - ZenBlog](https://www.zenblog.com/blog/best-email-platforms-for-developers-2025-comprehensive-guide)
