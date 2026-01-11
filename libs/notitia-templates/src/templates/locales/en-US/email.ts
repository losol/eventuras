import type { TemplateRegistry } from '../../../types';
import { buildOrderShippedTemplate } from '../../utils/orderShippedBuilder';

/**
 * American English email templates
 */
export const emailTemplatesEnUS: TemplateRegistry = {
  'email:welcome': {
    subject: 'Welcome to {{organizationName}}',
    content: `Hello {{name}},

Welcome to {{organizationName}}! We're excited to have you join our community.

{{#if loginUrl}}
You can access your account at: {{loginUrl}}
{{/if}}

Best regards,
The {{organizationName}} Team`,
    description: 'Welcome email for new users (en-US)',
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
    description: 'Event registration confirmation email (en-US)',
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
    description: 'Event reminder email (en-US)',
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
    description: 'Payment confirmation email (en-US)',
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
    description: 'Password reset email (en-US)',
  },

  'email:order-received': {
    subject: 'Order Received - #{{orderId}}',
    content: `Hello {{name}},

Thank you for your order! We have received it and will process it as soon as possible.

Order Details:
- Order ID: {{orderId}}
- Order Date: {{orderDate}}
{{#if totalAmount}}
- Total: {{totalAmount}} {{currency}}
{{/if}}

{{#if trackingNumber}}
Tracking Number: {{trackingNumber}}
{{/if}}

We will notify you when your payment is confirmed and your order is being processed.

Best regards,
The {{organizationName}} Team`,
    description: 'Order received confirmation email (en-US)',
  },

  'email:order-confirmation': {
    subject: 'Order Confirmation - #{{orderId}}',
    content: `Hello {{name}},

Your payment has been confirmed and your order is now being processed. We will start packing your items shortly.

Order Details:
- Order ID: {{orderId}}
- Order Date: {{orderDate}}
{{#if totalAmount}}
- Total: {{totalAmount}} {{currency}}
{{/if}}

{{#if trackingNumber}}
Tracking Number: {{trackingNumber}}
{{/if}}

We will notify you when your order ships.

Best regards,
The {{organizationName}} Team`,
    description: 'Order confirmation email after payment (en-US)',
  },

  'email:order-shipped': {
    subject: 'Your Order Has Shipped - #{{orderId}}',
    content: buildOrderShippedTemplate({
      headerTitle: 'Your Order Has Shipped! 🎉',
      greeting: 'Hello {{name}}! 👋',
      shippedMessage: 'Great news! Your order has been shipped and is now on its way to you. You can track your delivery using the information below.',
      shipmentDetailsTitle: 'Shipment Details',
      orderNumberLabel: 'Order Number',
      trackingNumberLabel: 'Tracking Number',
      trackingUrlLabel: 'Track Your Package',
      estimatedDeliveryLabel: 'Estimated Delivery',
      shippedProductsTitle: 'Shipped Products',
      productColumn: 'Product',
      quantityColumn: 'Quantity',
      shippingAddressTitle: 'Shipping Address',
      supportMessage: '💬 Questions about your delivery? Reply to this email and we\'ll help you.',
      footerClosing: 'Best regards',
    }),
    description: 'Order shipped notification email (en-US)',
  },
};
