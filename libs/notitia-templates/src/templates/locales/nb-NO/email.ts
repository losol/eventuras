import type { TemplateRegistry } from '../../../types';

/**
 * Norwegian Bokmål email templates
 */
export const emailTemplatesNbNO: TemplateRegistry = {
  'email:welcome': {
    subject: 'Velkommen til {{organizationName}}',
    content: `Hei {{name}},

Velkommen til {{organizationName}}! Vi er glade for at du blir med i vårt fellesskap.

{{#if loginUrl}}
Du kan logge inn på kontoen din her: {{loginUrl}}
{{/if}}

Beste hilsen,
{{organizationName}}-teamet`,
    description: 'Velkomst-e-post for nye brukere (nb-NO)',
  },

  'email:registration-confirmation': {
    subject: 'Påmelding bekreftet - {{eventTitle}}',
    content: `Hei {{name}},

Din påmelding til {{eventTitle}} er bekreftet!

Arrangement detaljer:
- Dato: {{eventDate}}
- Sted: {{eventLocation}}
{{#if eventDescription}}
- Beskrivelse: {{eventDescription}}
{{/if}}

{{#if registrationId}}
Påmeldings-ID: {{registrationId}}
{{/if}}

Vi gleder oss til å se deg der!

Beste hilsen,
{{organizationName}}-teamet`,
    description: 'Bekreftelse på arrangementspåmelding (nb-NO)',
  },

  'email:event-reminder': {
    subject: 'Påminnelse: {{eventTitle}} nærmer seg!',
    content: `Hei {{name}},

Dette er en påminnelse om at {{eventTitle}} nærmer seg!

Arrangement detaljer:
- Dato: {{eventDate}}
- Sted: {{eventLocation}}
{{#if eventUrl}}
- Mer informasjon: {{eventUrl}}
{{/if}}

Vi gleder oss til å se deg der!

Beste hilsen,
{{organizationName}}-teamet`,
    description: 'Påminnelse om arrangement (nb-NO)',
  },

  'email:payment-confirmation': {
    subject: 'Betalingsbekreftelse - Ordre #{{orderId}}',
    content: `Hei {{name}},

Takk for din betaling!

Betalingsdetaljer:
- Ordre-ID: {{orderId}}
- Beløp: {{amount}} {{currency}}
- Betalingsmåte: {{paymentMethod}}
{{#if transactionId}}
- Transaksjons-ID: {{transactionId}}
{{/if}}

{{#if receiptUrl}}
Du kan se kvitteringen din her: {{receiptUrl}}
{{/if}}

Beste hilsen,
{{organizationName}}-teamet`,
    description: 'Bekreftelse på betaling (nb-NO)',
  },

  'email:password-reset': {
    subject: 'Forespørsel om tilbakestilling av passord',
    content: `Hei {{name}},

Vi har mottatt en forespørsel om å tilbakestille passordet ditt.

{{#if resetUrl}}
For å tilbakestille passordet ditt, klikk på følgende lenke:
{{resetUrl}}

Denne lenken utløper om {{expirationHours}} timer.
{{/if}}

Hvis du ikke har bedt om tilbakestilling av passord, kan du ignorere denne e-posten.

Beste hilsen,
{{organizationName}}-teamet`,
    description: 'E-post for tilbakestilling av passord (nb-NO)',
  },

  'email:order-confirmation': {
    subject: 'Ordrebekreftelse - #{{orderId}}',
    content: `Hei {{name}},

Takk for din bestilling!

Ordredetaljer:
- Ordre-ID: {{orderId}}
- Bestillingsdato: {{orderDate}}
{{#if totalAmount}}
- Totalt: {{totalAmount}} {{currency}}
{{/if}}

{{#if trackingNumber}}
Sporingsnummer: {{trackingNumber}}
{{/if}}

Vi varsler deg når ordren din sendes.

Beste hilsen,
{{organizationName}}-teamet`,
    description: 'Bekreftelse på bestilling (nb-NO)',
  },

  'email:order-shipped': {
    subject: 'Din ordre er sendt - #{{orderId}}',
    content: `Hei {{name}},

Gode nyheter! Din ordre er sendt.

Ordredetaljer:
- Ordre-ID: {{orderId}}
{{#if trackingNumber}}
- Sporingsnummer: {{trackingNumber}}
{{/if}}
{{#if trackingUrl}}
- Spor pakken din: {{trackingUrl}}
{{/if}}

Estimert levering: {{estimatedDelivery}}

Beste hilsen,
{{organizationName}}-teamet`,
    description: 'Varsel om sending av ordre (nb-NO)',
  },
};
