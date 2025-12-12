import type { TemplateRegistry } from '../../../types';

/**
 * American English SMS templates
 */
export const smsTemplatesEnUS: TemplateRegistry = {
  'sms:welcome': {
    content: 'Welcome to {{organizationName}}, {{name}}! {{#if loginUrl}}Login: {{loginUrl}}{{/if}}',
    description: 'Welcome SMS for new users (en-US)',
  },

  'sms:registration-confirmation': {
    content:
      '{{organizationName}}: Your registration for {{eventTitle}} on {{eventDate}} is confirmed. {{#if registrationId}}Ref: {{registrationId}}{{/if}}',
    description: 'Event registration confirmation SMS (en-US)',
  },

  'sms:event-reminder': {
    content:
      'Reminder: {{eventTitle}} is on {{eventDate}} at {{eventLocation}}. See you there! - {{organizationName}}',
    description: 'Event reminder SMS (en-US)',
  },

  'sms:payment-confirmation': {
    content:
      '{{organizationName}}: Payment of {{amount}} {{currency}} received. Order #{{orderId}}. {{#if transactionId}}Ref: {{transactionId}}{{/if}}',
    description: 'Payment confirmation SMS (en-US)',
  },

  'sms:password-reset': {
    content: '{{organizationName}}: Password reset requested. {{#if resetUrl}}Reset at: {{resetUrl}}{{/if}}',
    description: 'Password reset SMS (en-US)',
  },

  'sms:order-confirmation': {
    content: '{{organizationName}}: Order #{{orderId}} confirmed. {{#if totalAmount}}Total: {{totalAmount}} {{currency}}.{{/if}} Thank you!',
    description: 'Order confirmation SMS (en-US)',
  },

  'sms:order-shipped': {
    content:
      '{{organizationName}}: Order #{{orderId}} shipped! {{#if trackingNumber}}Track: {{trackingNumber}}{{/if}}',
    description: 'Order shipped notification SMS (en-US)',
  },
};
