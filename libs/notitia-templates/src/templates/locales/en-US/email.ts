import type { TemplateRegistry } from '../../../types';
import { buildOrderStatusTemplate } from '../../utils/orderStatusBuilder';
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
    content: buildOrderStatusTemplate({
      copyBanner: 'COPY - Internal copy of customer confirmation',
      headerTitle: 'Order Received',
      greeting: 'Hello {{name}}! 👋',
      thankYouMessage: 'Thank you for your order! We have received it and will process it as soon as possible.',
      orderDetailsTitle: 'Order Details',
      orderNumberLabel: 'Order Number',
      orderDateLabel: 'Order Date',
      customerEmailLabel: 'Customer Email',
      customerPhoneLabel: 'Phone',
      orderedProductsTitle: 'Ordered Products',
      productColumn: 'Product',
      quantityColumn: 'Quantity',
      priceColumn: 'Price',
      sumColumn: 'Total',
      totalLabel: 'Total (incl. VAT)',
      totalLabelTaxExempt: 'Total (VAT Exempt)',
      taxExemptLabel: 'VAT Exempt',
      taxExemptReasonLabel: 'Reason',
      shippingAddressTitle: 'Shipping Address',
      trackingNumberLabel: 'Tracking Number',
      shippingNotification: 'We will notify you when your payment is confirmed and your order is being processed.',
      footerClosing: 'Best regards',
    }),
    description: 'Order received confirmation email (en-US)',
  },

  'email:order-confirmation': {
    subject: 'Order Confirmation - #{{orderId}}',
    content: buildOrderStatusTemplate({
      copyBanner: 'COPY - Internal copy of customer confirmation',
      headerTitle: 'Order Confirmation',
      greeting: 'Hello {{name}}! 👋',
      thankYouMessage: 'Your payment has been confirmed and your order is now being processed. We will start packing your items shortly.',
      orderDetailsTitle: 'Order Details',
      orderNumberLabel: 'Order Number',
      orderDateLabel: 'Order Date',
      customerEmailLabel: 'Customer Email',
      customerPhoneLabel: 'Phone',
      orderedProductsTitle: 'Ordered Products',
      productColumn: 'Product',
      quantityColumn: 'Quantity',
      priceColumn: 'Price',
      sumColumn: 'Total',
      totalLabel: 'Total (incl. VAT)',
      totalLabelTaxExempt: 'Total (VAT Exempt)',
      taxExemptLabel: 'VAT Exempt',
      taxExemptReasonLabel: 'Reason',
      shippingAddressTitle: 'Shipping Address',
      trackingNumberLabel: 'Tracking Number',
      shippingNotification: 'We will notify you when your order ships.',
      footerClosing: 'Best regards',
    }),
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

  'email:otp-login': {
    subject: '{{appName}} - Your Login Code',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Login Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 32px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 600;">{{appName}} - Login Code</h1>
    </div>
    <div style="padding: 40px 32px; text-align: center;">
      <p style="color: #4a5568; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0;">
        Your one-time login code is:
      </p>
      <div style="background-color: #f7fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 32px 0;">
        <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #2d3748; font-family: 'Courier New', monospace;">
          {{code}}
        </div>
        <p style="color: #718096; font-size: 14px; margin-top: 16px;">
          This code will expire in {{expiresInMinutes}} minutes.
        </p>
      </div>
      <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; text-align: left;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </div>
    </div>
    <div style="background-color: #f7fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; color: #a0aec0; font-size: 12px;">
        This is an automated message, please do not reply.
      </p>
      <p style="margin: 8px 0 0 0; color: #a0aec0; font-size: 12px;">
        &copy; {{year}} {{appName}}
      </p>
    </div>
  </div>
</body>
</html>`,
    description: 'OTP login code email (en-US)',
  },
};
