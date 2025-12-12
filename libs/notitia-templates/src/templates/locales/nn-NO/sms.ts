import type { TemplateRegistry } from '../../../types';

/**
 * Norwegian Nynorsk SMS templates
 */
export const smsTemplatesNnNO: TemplateRegistry = {
  'sms:welcome': {
    content: 'Velkomen til {{organizationName}}, {{name}}! {{#if loginUrl}}Logg inn: {{loginUrl}}{{/if}}',
    description: 'Velkomst-SMS for nye brukarar (nn-NO)',
  },

  'sms:registration-confirmation': {
    content:
      '{{organizationName}}: Påmeldinga di til {{eventTitle}} den {{eventDate}} er stadfesta. {{#if registrationId}}Ref: {{registrationId}}{{/if}}',
    description: 'Stadfesting på arrangementspåmelding (nn-NO)',
  },

  'sms:event-reminder': {
    content:
      'Påminning: {{eventTitle}} er den {{eventDate}} på {{eventLocation}}. Sjåast der! - {{organizationName}}',
    description: 'Påminning om arrangement (nn-NO)',
  },

  'sms:payment-confirmation': {
    content:
      '{{organizationName}}: Betaling på {{amount}} {{currency}} motteke. Ordre #{{orderId}}. {{#if transactionId}}Ref: {{transactionId}}{{/if}}',
    description: 'Stadfesting på betaling (nn-NO)',
  },

  'sms:password-reset': {
    content: '{{organizationName}}: Førespurnad om tilbakestilling av passord. {{#if resetUrl}}Tilbakestill her: {{resetUrl}}{{/if}}',
    description: 'SMS for tilbakestilling av passord (nn-NO)',
  },

  'sms:order-confirmation': {
    content: '{{organizationName}}: Ordre #{{orderId}} stadfesta. {{#if totalAmount}}Totalt: {{totalAmount}} {{currency}}.{{/if}} Takk!',
    description: 'Stadfesting på bestilling (nn-NO)',
  },

  'sms:order-shipped': {
    content:
      '{{organizationName}}: Ordre #{{orderId}} sendt! {{#if trackingNumber}}Spor: {{trackingNumber}}{{/if}}',
    description: 'Varsel om sending av ordre (nn-NO)',
  },
};
