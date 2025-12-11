# Notitia Templates - Library Specification

## Overview

**Notitia Templates** is a Handlebars-based library for generating personalized SMS and email texts. The library comes with a set of default templates but also supports custom and overridden templates.

- **Library Name**: `@eventuras/notitia-templates`
- **Location**: `libs/notitia-templates`
- **Version**: 0.1.0
- **License**: MIT
- **Templating Engine**: Handlebars 4.7.8

## Core Functionality

### 1. Template Rendering

Templates are rendered by combining them with an object of named parameters. The result is a ready-to-use personalized text string for any notification channel.

```typescript
import { notitiaTemplates } from '@eventuras/notitia-templates';

const result = notitiaTemplates.render('email', 'welcome', {
  name: 'John Doe',
  organizationName: 'Eventuras',
  loginUrl: 'https://app.eventuras.com/login',
});

// result.subject: "Welcome to Eventuras"
// result.content: "Hello John Doe,\n\nWelcome to Eventuras!..."

// Example with Norwegian template:
const norwegianResult = notitiaTemplates.render('email', 'welcome', {
  name: 'Ola Nordmann',
  organizationName: 'Eventuras',
  loginUrl: 'https://app.eventuras.com/login',
});
```

### 2. Default Templates

The library comes with default templates for common notification scenarios:

#### Email Templates
- `email:welcome` - Welcome message for new users
- `email:registration-confirmation` - Event registration confirmation
- `email:event-reminder` - Reminder for upcoming events
- `email:payment-confirmation` - Confirmation of successful payment
- `email:password-reset` - Password reset instructions
- `email:order-confirmation` - Order confirmation
- `email:order-shipped` - Shipment notification

#### SMS Templates
- `sms:welcome` - Welcome SMS (short version)
- `sms:registration-confirmation` - Registration confirmation (short version)
- `sms:event-reminder` - Event reminder (short version)
- `sms:payment-confirmation` - Payment confirmation (short version)
- `sms:password-reset` - Password reset (short version)
- `sms:order-confirmation` - Order confirmation (short version)
- `sms:order-shipped` - Shipment notification (short version)

### 3. Custom Templates

Users can easily override default templates or create entirely new ones:

```typescript
// Override default template (example with Norwegian)
notitiaTemplates.registerTemplate('email', 'welcome', {
  subject: 'Velkommen til {{organizationName}}',
  content: 'Hei {{name}}, velkommen til vår plattform!',
  description: 'Custom welcome message in Norwegian',
});

// Create new template
notitiaTemplates.registerTemplate('email', 'custom', {
  subject: 'Special Offer for {{name}}',
  content: 'We have a special offer for you: {{offerText}}',
});
```

### 4. Handlebars Functions

The library includes built-in helper functions:

- **formatDate** - Formats dates
- **upper** - Converts text to uppercase
- **lower** - Converts text to lowercase  
- **eq** - Compares values for equality

Custom helper functions can also be registered:

```typescript
notitiaTemplates.registerHelper('currency', function (amount: number, currency: string) {
  return `${amount.toFixed(2)} ${currency}`;
});
```

## Architecture

### Class Structure

```typescript
class NotitiaTemplates {
  // Render a template with parameters
  render(channel, type, params, options?): RenderedTemplate
  
  // Render custom template string directly
  renderCustom(templateString, params, options?): string
  
  // Register custom template
  registerTemplate(channel, type, template): void
  
  // Register multiple templates at once
  registerTemplates(templates): void
  
  // Remove custom template
  unregisterTemplate(channel, type): void
  
  // Clear all custom templates
  clearCustomTemplates(): void
  
  // Register Handlebars helper function
  registerHelper(name, helper): void
  
  // Check if template exists
  hasTemplate(channel, type): boolean
  
  // Get available template keys
  getAvailableTemplates(): string[]
  
  // Get template metadata
  getTemplateInfo(channel, type): Template | undefined
}
```

### TypeScript Types

```typescript
type NotificationChannel = 'email' | 'sms';

type TemplateType = 
  | 'welcome'
  | 'registration-confirmation'
  | 'event-reminder'
  | 'payment-confirmation'
  | 'password-reset'
  | 'order-confirmation'
  | 'order-shipped'
  | 'custom';

interface Template {
  content: string;
  subject?: string;
  description?: string;
}

interface RenderedTemplate {
  content: string;
  subject?: string;
}

interface RenderOptions {
  strict?: boolean;
  helpers?: { [name: string]: Handlebars.HelperDelegate };
}
```

## Use Cases

### 1. Simple Usage (Singleton)

For simple applications with consistent templates:

```typescript
import { notitiaTemplates } from '@eventuras/notitia-templates';

const email = notitiaTemplates.render('email', 'welcome', { 
  name: 'Jane',
  organizationName: 'My Company' 
});
```

### 2. Multi-tenant Instances

For applications with multiple clients that need their own templates:

```typescript
import { createNotitiaTemplates } from '@eventuras/notitia-templates';

const tenant1Templates = createNotitiaTemplates();
const tenant2Templates = createNotitiaTemplates();

// Example with Norwegian template
tenant1Templates.registerTemplate('email', 'welcome', {
  subject: 'Velkommen til Kunde 1',
  content: 'Spesialtilpasset for kunde 1...',
});

tenant2Templates.registerTemplate('email', 'welcome', {
  subject: 'Welcome to Customer 2',
  content: 'Custom for customer 2...',
});
```

### 3. E-commerce Flow

```typescript
// Order confirmation (example with Norwegian names)
const orderEmail = notitiaTemplates.render('email', 'order-confirmation', {
  name: 'Per Hansen',
  orderId: 'ORD-12345',
  orderDate: '2025-06-10',
  totalAmount: '1499.00',
  currency: 'NOK',
  organizationName: 'My Online Store',
});

// Shipment notification
const shipmentEmail = notitiaTemplates.render('email', 'order-shipped', {
  name: 'Per Hansen',
  orderId: 'ORD-12345',
  trackingNumber: 'TRACK-67890',
  estimatedDelivery: '2025-06-20',
  organizationName: 'My Online Store',
});
```

### 4. Event Management

```typescript
// Registration confirmation (example with Norwegian event name)
const confirmation = notitiaTemplates.render('email', 'registration-confirmation', {
  name: 'Jane Smith',
  eventTitle: 'Sommerkonferanse 2025',
  eventDate: '2025-07-15',
  eventLocation: 'Oslo Convention Center',
  registrationId: 'REG-789',
  organizationName: 'Eventuras',
});

// SMS reminder
const reminder = notitiaTemplates.render('sms', 'event-reminder', {
  organizationName: 'Eventuras',
  eventTitle: 'Sommerkonferanse',
  eventDate: 'July 15',
  eventLocation: 'Oslo',
});
```

## Technical Details

### Dependencies

**Production Dependencies:**
- `handlebars` ^4.7.8 - Templating engine

**Development Dependencies:**
- `vite` 7.2.6 - Build tool
- `vitest` 4.0.15 - Test framework
- `typescript` 5.9.3 - Type support
- `@eventuras/vite-config` - Shared build configurations
- `@eventuras/typescript-config` - Shared TypeScript configurations

### Building

```bash
pnpm build  # Builds the library with Vite
pnpm dev    # Development mode with watch
pnpm test   # Runs tests (28 tests)
pnpm lint   # Runs linting
```

### Testing

The library has a comprehensive test suite with 28 tests covering:
- Default template rendering
- Custom templates and overriding
- Conditional blocks and logic
- Built-in and custom helper functions
- Error handling
- Template management

### Node.js Compatibility

The library requires Node.js 22+ and uses ESM (ECMAScript Modules). To handle TypeScript configurations in Vite with Node 20, the build script uses `NODE_OPTIONS="--import tsx"`.

## Benefits

1. **Unified Interface**: Same API for SMS and email
2. **Flexible**: From simple to complex messages
3. **Extensible**: Easy to add new templates and helper functions
4. **Type-safe**: Full TypeScript support
5. **Tested**: Comprehensive test suite
6. **Documented**: Detailed README with examples
7. **Isolated**: Each instance has its own template registry

## Future Extensions

The library is designed to be easily extended with:
- More default templates as needed
- Multi-language support (i18n)
- Template validation
- Template caching for performance
- Async rendering
- Template versioning system
- Integrasjon med externe maldatabaser

## Conclusion

Notitia Templates provides a unified and flexible way to handle notification messages across different channels. With its strong foundation in Handlebars and comprehensive default templates, it makes it easy to get started while being flexible enough to cover advanced use cases and customization needs.
