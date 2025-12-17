import type { TemplateRegistry } from '../types';
import { buildOrderConfirmationTemplate } from './utils/orderConfirmationBuilder';

/**
 * Default email templates
 */
export const defaultEmailTemplates: TemplateRegistry = {
  'email:welcome': {
    subject: 'Welcome to {{organizationName}}',
    content: `Hello {{name}},

Welcome to {{organizationName}}! We're excited to have you join our community.

{{#if loginUrl}}
You can access your account at: {{loginUrl}}
{{/if}}

Best regards,
The {{organizationName}} Team`,
    description: 'Welcome email for new users',
  },

  'email:registration-confirmation': {
    subject: 'Registration Confirmed - {{eventTitle}}',
    content: `Hello {{name}},

Your registration for {{eventTitle}} has been confirmed!

Event Details:
- Date: {{eventDate}}
- Location: {{eventLocation}}
{{#if eventDescription}}
- Description: {{eventDescription}}
{{/if}}

{{#if registrationId}}
Registration ID: {{registrationId}}
{{/if}}

We look forward to seeing you there!

Best regards,
The {{organizationName}} Team`,
    description: 'Event registration confirmation email',
  },

  'email:event-reminder': {
    subject: 'Reminder: {{eventTitle}} is coming up!',
    content: `Hello {{name}},

This is a friendly reminder that {{eventTitle}} is coming up soon!

Event Details:
- Date: {{eventDate}}
- Location: {{eventLocation}}
{{#if eventUrl}}
- More information: {{eventUrl}}
{{/if}}

We look forward to seeing you there!

Best regards,
The {{organizationName}} Team`,
    description: 'Event reminder email',
  },

  'email:payment-confirmation': {
    subject: 'Payment Confirmation - Order #{{orderId}}',
    content: `Hello {{name}},

Thank you for your payment!

Payment Details:
- Order ID: {{orderId}}
- Amount: {{amount}} {{currency}}
- Payment Method: {{paymentMethod}}
{{#if transactionId}}
- Transaction ID: {{transactionId}}
{{/if}}

{{#if receiptUrl}}
You can view your receipt at: {{receiptUrl}}
{{/if}}

Best regards,
The {{organizationName}} Team`,
    description: 'Payment confirmation email',
  },

  'email:password-reset': {
    subject: 'Password Reset Request',
    content: `Hello {{name}},

We received a request to reset your password.

{{#if resetUrl}}
To reset your password, please click the following link:
{{resetUrl}}

This link will expire in {{expirationHours}} hours.
{{/if}}

If you did not request a password reset, please ignore this email.

Best regards,
The {{organizationName}} Team`,
    description: 'Password reset email',
  },

  'email:order-confirmation': {
    subject: 'Ordrebekreftelse - #{{orderId}}',
    content: buildOrderConfirmationTemplate({
      copyBanner: 'KOPI - Intern kopi av kundebekreftelse',
      headerTitle: 'Ordrebekreftelse',
      greeting: 'Hei {{name}}! 👋',
      thankYouMessage: 'Takk for din bestilling! Vi har mottatt ordren din og begynner å behandle den med en gang.',
      orderDetailsTitle: 'Ordredetaljer',
      orderNumberLabel: 'Ordrenummer',
      orderDateLabel: 'Ordredato',
      customerEmailLabel: 'Kunde e-post',
      orderedProductsTitle: 'Bestilte produkter',
      productColumn: 'Produkt',
      quantityColumn: 'Antall',
      priceColumn: 'Pris',
      sumColumn: 'Sum',
      totalLabel: 'Totalt (inkl. mva)',
      shippingAddressTitle: 'Leveringsadresse',
      trackingNumberLabel: 'Sporingsnummer',
      shippingNotification: 'Vi vil sende deg en epost når ordren din er sendt.',
      footerClosing: 'Med vennlig hilsen',
    }),
    description: 'Order confirmation email',
  },



  'email:order-shipped': {
    subject: 'Your Order Has Shipped - #{{orderId}}',
    content: `Hello {{name}},

Good news! Your order has been shipped.

Order Details:
- Order ID: {{orderId}}
{{#if trackingNumber}}
- Tracking Number: {{trackingNumber}}
{{/if}}
{{#if trackingUrl}}
- Track your package: {{trackingUrl}}
{{/if}}

Estimated delivery: {{estimatedDelivery}}

Best regards,
The {{organizationName}} Team`,
    description: 'Order shipped notification email',
  },
};
