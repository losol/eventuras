import type { TemplateRegistry } from '../../../types';

/**
 * Norwegian Bokmål SMS templates
 */
export const smsTemplatesNbNO: TemplateRegistry = {
  'sms:welcome': {
    content: 'Velkommen til {{organizationName}}, {{name}}! {{#if loginUrl}}Logg inn: {{loginUrl}}{{/if}}',
    description: 'Velkomst-SMS for nye brukere (nb-NO)',
  },

  'sms:registration-confirmation': {
    content:
      '{{organizationName}}: Din påmelding til {{eventTitle}} den {{eventDate}} er bekreftet. {{#if registrationId}}Ref: {{registrationId}}{{/if}}',
    description: 'Bekreftelse på arrangementspåmelding (nb-NO)',
  },

  'sms:event-reminder': {
    content:
      'Påminnelse: {{eventTitle}} er den {{eventDate}} på {{eventLocation}}. Sees der! - {{organizationName}}',
    description: 'Påminnelse om arrangement (nb-NO)',
  },

  'sms:payment-confirmation': {
    content:
      '{{organizationName}}: Betaling på {{amount}} {{currency}} mottatt. Ordre #{{orderId}}. {{#if transactionId}}Ref: {{transactionId}}{{/if}}',
    description: 'Bekreftelse på betaling (nb-NO)',
  },

  'sms:password-reset': {
    content: '{{organizationName}}: Forespørsel om tilbakestilling av passord. {{#if resetUrl}}Tilbakestill her: {{resetUrl}}{{/if}}',
    description: 'SMS for tilbakestilling av passord (nb-NO)',
  },

  'sms:order-confirmation': {
    content: '{{organizationName}}: Ordre #{{orderId}} bekreftet. {{#if totalAmount}}Totalt: {{totalAmount}} {{currency}}.{{/if}} Takk!',
    description: 'Bekreftelse på bestilling (nb-NO)',
  },

  'sms:order-shipped': {
    content:
      '{{organizationName}}: Ordre #{{orderId}} sendt! {{#if trackingNumber}}Spor: {{trackingNumber}}{{/if}}',
    description: 'Varsel om sending av ordre (nb-NO)',
  },
};
