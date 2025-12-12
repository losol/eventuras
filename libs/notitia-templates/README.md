# @eventuras/notitia-templates

> Handlebars-based library for generating SMS and email texts with support for default templates and custom overrides.

## Overview

Notitia Templates is a flexible templating library built on Handlebars that helps you generate personalized notification messages for SMS and email channels. It comes with a comprehensive set of default templates for common scenarios, while allowing full customization and override capabilities.

## Features

- 🎯 **Built-in Templates**: Ready-to-use templates for common notification scenarios
- 🔧 **Customizable**: Override default templates or create your own
- 📱 **Multi-channel**: Support for both email (with subjects) and SMS
- 🌐 **Multi-language**: Built-in support for American English, Norwegian Bokmål, and Norwegian Nynorsk
- 🛠️ **Handlebars Powered**: Full power of Handlebars templating
- 🎨 **Custom Helpers**: Built-in helpers and ability to add your own
- 📦 **Type-safe**: Full TypeScript support
- 🔒 **Isolated**: Each instance has its own template registry

## Installation

```bash
pnpm add @eventuras/notitia-templates
```

## Quick Start

```typescript
import { notitiaTemplates } from '@eventuras/notitia-templates';

// Render a welcome email
const welcomeEmail = notitiaTemplates.render('email', 'welcome', {
  name: 'John Doe',
  organizationName: 'Eventuras',
  loginUrl: 'https://app.eventuras.com/login',
});

console.log(welcomeEmail.subject);
// Output: "Welcome to Eventuras"

console.log(welcomeEmail.content);
// Output: "Hello John Doe,\n\nWelcome to Eventuras!..."
```

## Usage

### Basic Template Rendering

Use the singleton instance for simple use cases:

```typescript
import { notitiaTemplates } from '@eventuras/notitia-templates';

// Render an event registration confirmation
const confirmation = notitiaTemplates.render('email', 'registration-confirmation', {
  name: 'Jane Smith',
  eventTitle: 'Tech Conference 2025',
  eventDate: '2025-06-15',
  eventLocation: 'Oslo Convention Center',
  registrationId: 'REG-12345',
  organizationName: 'Eventuras',
});
```

### Creating Custom Instances

For applications with multiple tenants or different template sets:

```typescript
import { createNotitiaTemplates } from '@eventuras/notitia-templates';

const tenantTemplates = createNotitiaTemplates();
// Each instance has its own registry
```

### Multi-language Support

The library includes built-in templates in three languages:
- **en-US**: American English (default)
- **nb-NO**: Norwegian Bokmål
- **nn-NO**: Norwegian Nynorsk

#### Setting Default Locale

```typescript
import { createNotitiaTemplates } from '@eventuras/notitia-templates';

// Create instance with Norwegian Bokmål as default
const norwegianTemplates = createNotitiaTemplates('nb-NO');

const welcome = norwegianTemplates.render('email', 'welcome', {
  name: 'Ola Nordmann',
  organizationName: 'Eventuras',
});

console.log(welcome.subject);
// Output: "Velkommen til Eventuras"

console.log(welcome.content);
// Output: "Hei Ola Nordmann,\n\nVelkommen til Eventuras!..."
```

#### Per-request Locale Override

```typescript
import { notitiaTemplates } from '@eventuras/notitia-templates';

// Default instance uses en-US, but you can override per render
const norwegianWelcome = notitiaTemplates.render(
  'email',
  'welcome',
  {
    name: 'Kari Hansen',
    organizationName: 'Eventuras',
  },
  { locale: 'nb-NO' } // Override locale for this render
);

// Render in Nynorsk
const nynorskWelcome = notitiaTemplates.render(
  'email',
  'welcome',
  {
    name: 'Per Olsen',
    organizationName: 'Eventuras',
  },
  { locale: 'nn-NO' }
);

console.log(nynorskWelcome.subject);
// Output: "Velkomen til Eventuras" (note: "Velkomen" in Nynorsk)
```

#### Supported Locales

```typescript
import type { Locale } from '@eventuras/notitia-templates';

// Available locales
const locales: Locale[] = ['en-US', 'nb-NO', 'nn-NO'];
```

All built-in templates (welcome, registration-confirmation, event-reminder, payment-confirmation, password-reset, order-confirmation, order-shipped) are available in all three languages.

### Custom Templates

Override default templates or create new ones:

```typescript
import { notitiaTemplates } from '@eventuras/notitia-templates';

// Register a custom template
notitiaTemplates.registerTemplate('email', 'custom', {
  subject: 'Welcome to {{companyName}}',
  content: `Dear {{name}},

We're thrilled to have you!

{{#if specialOffer}}
Special Offer: {{specialOffer}}
{{/if}}

Best regards,
{{companyName}} Team`,
  description: 'Custom welcome email with special offer',
});

// Use the custom template
const result = notitiaTemplates.render('email', 'custom', {
  name: 'Alice',
  companyName: 'Acme Corp',
  specialOffer: '20% off your first order',
});
```

### Batch Registration

Register multiple templates at once:

```typescript
notitiaTemplates.registerTemplates({
  'email:onboarding': {
    subject: 'Welcome aboard!',
    content: 'Hello {{name}}, let\'s get started...',
  },
  'sms:verification': {
    content: 'Your verification code is {{code}}',
  },
});
```

### Custom Handlebars Helpers

Add reusable logic with custom helpers:

```typescript
// Register a global helper
notitiaTemplates.registerHelper('currency', function (amount: number, currency: string) {
  return `${amount.toFixed(2)} ${currency}`;
});

// Use in template
notitiaTemplates.registerTemplate('email', 'invoice', {
  subject: 'Invoice #{{invoiceId}}',
  content: 'Total amount: {{currency amount "NOK"}}',
});

const result = notitiaTemplates.render('email', 'invoice', {
  invoiceId: 'INV-001',
  amount: 1499.5,
});
// Output: "Total amount: 1499.50 NOK"
```

### One-time Helpers

Use helpers for a single render operation:

```typescript
const result = notitiaTemplates.render(
  'email',
  'welcome',
  {
    firstName: 'john',
    lastName: 'doe',
  },
  {
    helpers: {
      capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
    },
  }
);
```

### Direct Template Rendering

Render template strings without registering them:

```typescript
const result = notitiaTemplates.renderCustom(
  'Hello {{name}}, your code is {{code}}',
  {
    name: 'Alice',
    code: '12345',
  }
);
// Output: "Hello Alice, your code is 12345"
```

## Built-in Templates

### Email Templates

- `email:welcome` - Welcome new users
- `email:registration-confirmation` - Confirm event registration
- `email:event-reminder` - Remind users about upcoming events
- `email:payment-confirmation` - Confirm successful payments
- `email:password-reset` - Password reset instructions
- `email:order-confirmation` - Confirm order placement
- `email:order-shipped` - Notify about order shipment

### SMS Templates

- `sms:welcome` - Welcome new users (short form)
- `sms:registration-confirmation` - Confirm event registration (short form)
- `sms:event-reminder` - Event reminders (short form)
- `sms:payment-confirmation` - Payment confirmations (short form)
- `sms:password-reset` - Password reset notification (short form)
- `sms:order-confirmation` - Order confirmations (short form)
- `sms:order-shipped` - Shipment notifications (short form)

## Built-in Helpers

### formatDate

Format date strings:

```handlebars
Event date: {{formatDate eventDate}}
```

### upper

Convert text to uppercase:

```handlebars
{{upper name}}
```

### lower

Convert text to lowercase:

```handlebars
{{lower email}}
```

### eq

Compare values for equality:

```handlebars
{{#if (eq status "active")}}
  Account is active
{{else}}
  Account is inactive
{{/if}}
```

## API Reference

### NotitiaTemplates Class

#### Methods

##### `render(channel, type, params, options?)`

Render a template with the provided parameters.

```typescript
render(
  channel: 'email' | 'sms',
  type: TemplateType,
  params: Record<string, any>,
  options?: RenderOptions
): RenderedTemplate
```

##### `renderCustom(templateString, params, options?)`

Render a custom template string directly.

```typescript
renderCustom(
  templateString: string,
  params: Record<string, any>,
  options?: RenderOptions
): string
```

##### `registerTemplate(channel, type, template)`

Register a custom template.

```typescript
registerTemplate(
  channel: 'email' | 'sms',
  type: TemplateType,
  template: Template
): void
```

##### `registerTemplates(templates)`

Register multiple templates at once.

```typescript
registerTemplates(templates: Record<string, Template>): void
```

##### `unregisterTemplate(channel, type)`

Remove a custom template (falls back to default if available).

```typescript
unregisterTemplate(channel: 'email' | 'sms', type: TemplateType): void
```

##### `clearCustomTemplates()`

Clear all custom templates.

```typescript
clearCustomTemplates(): void
```

##### `registerHelper(name, helper)`

Register a custom Handlebars helper.

```typescript
registerHelper(name: string, helper: Handlebars.HelperDelegate): void
```

##### `hasTemplate(channel, type)`

Check if a template exists.

```typescript
hasTemplate(channel: 'email' | 'sms', type: TemplateType): boolean
```

##### `getAvailableTemplates()`

Get all available template keys.

```typescript
getAvailableTemplates(): string[]
```

##### `getTemplateInfo(channel, type)`

Get template metadata without rendering.

```typescript
getTemplateInfo(channel: 'email' | 'sms', type: TemplateType): Template | undefined
```

## TypeScript Types

```typescript
import type {
  NotificationChannel,    // 'email' | 'sms'
  TemplateType,           // 'welcome' | 'registration-confirmation' | ...
  Template,               // Template definition
  RenderedTemplate,       // Render result
  BaseTemplateParams,     // Parameter object
  RenderOptions,          // Rendering options
} from '@eventuras/notitia-templates';
```

## Examples

### Event Registration Flow

```typescript
import { notitiaTemplates } from '@eventuras/notitia-templates';

// Send confirmation email
const emailConfirmation = notitiaTemplates.render('email', 'registration-confirmation', {
  name: 'John Doe',
  eventTitle: 'Summer Conference 2025',
  eventDate: '2025-07-15',
  eventLocation: 'Oslo Convention Center',
  registrationId: 'REG-789',
  organizationName: 'Eventuras',
});

// Send confirmation SMS
const smsConfirmation = notitiaTemplates.render('sms', 'registration-confirmation', {
  organizationName: 'Eventuras',
  eventTitle: 'Summer Conference 2025',
  eventDate: 'Jul 15, 2025',
  registrationId: 'REG-789',
});
```

### E-commerce Order Flow

```typescript
// Order confirmation
const orderEmail = notitiaTemplates.render('email', 'order-confirmation', {
  name: 'Jane Smith',
  orderId: 'ORD-12345',
  orderDate: '2025-06-10',
  totalAmount: '1499.00',
  currency: 'NOK',
  organizationName: 'My Shop',
});

// Shipment notification
const shipmentEmail = notitiaTemplates.render('email', 'order-shipped', {
  name: 'Jane Smith',
  orderId: 'ORD-12345',
  trackingNumber: 'TRACK-67890',
  trackingUrl: 'https://tracking.example.com/TRACK-67890',
  estimatedDelivery: '2025-06-20',
  organizationName: 'My Shop',
});
```

### Enhanced Order Confirmation with Items

For better-looking order confirmations without tables, use repeatable divs with Handlebars `each` helper:

```typescript
import { notitiaTemplates } from '@eventuras/notitia-templates';

// Register a custom order confirmation template with item details
notitiaTemplates.registerTemplate('email', 'order-confirmation-detailed', {
  subject: 'Order Confirmation - #{{orderId}}',
  content: `Hello {{name}},

Thank you for your order!

─────────────────────────────
ORDER #{{orderId}}
Order Date: {{orderDate}}
─────────────────────────────

{{#each items}}
📦 {{this.name}}
   Quantity: {{this.quantity}} × {{this.price}} {{../currency}}
   Subtotal: {{this.subtotal}} {{../currency}}
{{#unless @last}}

{{/unless}}
{{/each}}

─────────────────────────────
Subtotal:    {{subtotal}} {{currency}}
Shipping:    {{shipping}} {{currency}}
Tax:         {{tax}} {{currency}}
─────────────────────────────
TOTAL:       {{total}} {{currency}}
─────────────────────────────

{{#if shippingAddress}}
📍 Shipping Address:
{{shippingAddress.street}}
{{shippingAddress.postalCode}} {{shippingAddress.city}}
{{shippingAddress.country}}
{{/if}}

{{#if trackingNumber}}
🚚 Tracking: {{trackingNumber}}
{{/if}}

Questions? Reply to this email or visit our support page.

Best regards,
{{organizationName}}`,
  description: 'Detailed order confirmation with line items',
});

// Render with structured data
const detailedOrder = notitiaTemplates.render('email', 'order-confirmation-detailed', {
  name: 'Alice Johnson',
  orderId: 'ORD-98765',
  orderDate: '2025-06-15',
  organizationName: 'Nordic Shop',
  currency: 'NOK',
  items: [
    {
      name: 'Wireless Headphones',
      quantity: 2,
      price: '599.00',
      subtotal: '1198.00'
    },
    {
      name: 'USB-C Cable',
      quantity: 3,
      price: '99.00',
      subtotal: '297.00'
    },
    {
      name: 'Phone Case',
      quantity: 1,
      price: '249.00',
      subtotal: '249.00'
    }
  ],
  subtotal: '1744.00',
  shipping: '99.00',
  tax: '435.75',
  total: '2278.75',
  shippingAddress: {
    street: 'Storgata 15',
    postalCode: '0155',
    city: 'Oslo',
    country: 'Norway'
  },
  trackingNumber: 'NO-TRACK-2025-001'
});
```

**Alternative: Minimal Style**

For a cleaner look, you can create an even simpler template:

```typescript
notitiaTemplates.registerTemplate('email', 'order-minimal', {
  subject: '✓ Order {{orderId}} Confirmed',
  content: `Hi {{name}}! 👋

Your order is confirmed and will ship soon.

{{#each items}}
• {{this.quantity}}× {{this.name}} — {{this.subtotal}} {{../currency}}
{{/each}}

Total: {{total}} {{currency}}

We'll email you when it ships.

— {{organizationName}}`,
  description: 'Minimal order confirmation',
});
```

**Tips for Good-Looking Email Templates:**

1. **Use Unicode characters** for visual appeal: ─, •, ✓, 📦, 🚚, 📍
2. **Align with spaces** instead of tables for better plain-text rendering
3. **Keep lines short** (< 70 chars) for mobile readability
4. **Use blank lines** to create visual sections
5. **Use `each` helper** for repeating items without HTML tables
6. **Use conditional blocks** (`{{#if}}`) to show/hide optional sections

### Multi-tenant Application

```typescript
import { createNotitiaTemplates } from '@eventuras/notitia-templates';

// Create separate instances for different tenants
const tenant1Templates = createNotitiaTemplates();
const tenant2Templates = createNotitiaTemplates();

// Customize for tenant 1
tenant1Templates.registerTemplate('email', 'welcome', {
  subject: 'Welcome to Tenant 1',
  content: 'Custom branding for Tenant 1...',
});

// Customize for tenant 2
tenant2Templates.registerTemplate('email', 'welcome', {
  subject: 'Welcome to Tenant 2',
  content: 'Different branding for Tenant 2...',
});
```

## Best Practices

1. **Use the singleton** for simple applications with consistent templates
2. **Create instances** for multi-tenant or complex applications
3. **Keep templates simple** - use helpers for complex logic
4. **Validate parameters** before rendering to avoid runtime errors
5. **Test templates** with various parameter combinations
6. **Document custom templates** with the `description` field
7. **Use strict mode** during development to catch missing variables

## License

MIT

## Contributing

Contributions are welcome! Please see the [main repository](https://github.com/losol/eventuras) for contribution guidelines.
