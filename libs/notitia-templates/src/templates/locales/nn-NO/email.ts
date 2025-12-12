import type { TemplateRegistry } from '../../../types';

/**
 * Norwegian Nynorsk email templates
 */
export const emailTemplatesNnNO: TemplateRegistry = {
  'email:welcome': {
    subject: 'Velkomen til {{organizationName}}',
    content: `Hei {{name}},

Velkomen til {{organizationName}}! Vi er glade for at du blir med i fellesskapet vårt.

{{#if loginUrl}}
Du kan logge inn på kontoen din her: {{loginUrl}}
{{/if}}

Beste helsing,
{{organizationName}}-teamet`,
    description: 'Velkomst-e-post for nye brukarar (nn-NO)',
  },

  'email:registration-confirmation': {
    subject: 'Påmelding stadfesta - {{eventTitle}}',
    content: `Hei {{name}},

Påmeldinga di til {{eventTitle}} er stadfesta!

Arrangement detaljar:
- Dato: {{eventDate}}
- Stad: {{eventLocation}}
{{#if eventDescription}}
- Skildring: {{eventDescription}}
{{/if}}

{{#if registrationId}}
Påmeldings-ID: {{registrationId}}
{{/if}}

Vi gler oss til å sjå deg der!

Beste helsing,
{{organizationName}}-teamet`,
    description: 'Stadfesting på arrangementspåmelding (nn-NO)',
  },

  'email:event-reminder': {
    subject: 'Påminning: {{eventTitle}} nærmar seg!',
    content: `Hei {{name}},

Dette er ei påminning om at {{eventTitle}} nærmar seg!

Arrangement detaljar:
- Dato: {{eventDate}}
- Stad: {{eventLocation}}
{{#if eventUrl}}
- Meir informasjon: {{eventUrl}}
{{/if}}

Vi gler oss til å sjå deg der!

Beste helsing,
{{organizationName}}-teamet`,
    description: 'Påminning om arrangement (nn-NO)',
  },

  'email:payment-confirmation': {
    subject: 'Betalingsstadfesting - Ordre #{{orderId}}',
    content: `Hei {{name}},

Takk for betalinga di!

Betalingsdetaljar:
- Ordre-ID: {{orderId}}
- Beløp: {{amount}} {{currency}}
- Betalingsmåte: {{paymentMethod}}
{{#if transactionId}}
- Transaksjons-ID: {{transactionId}}
{{/if}}

{{#if receiptUrl}}
Du kan sjå kvitteringa di her: {{receiptUrl}}
{{/if}}

Beste helsing,
{{organizationName}}-teamet`,
    description: 'Stadfesting på betaling (nn-NO)',
  },

  'email:password-reset': {
    subject: 'Førespurnad om tilbakestilling av passord',
    content: `Hei {{name}},

Vi har motteke ei førespurnad om å tilbakestille passordet ditt.

{{#if resetUrl}}
For å tilbakestille passordet ditt, klikk på følgjande lenke:
{{resetUrl}}

Denne lenka går ut om {{expirationHours}} timar.
{{/if}}

Dersom du ikkje har bedt om tilbakestilling av passord, kan du ignorere denne e-posten.

Beste helsing,
{{organizationName}}-teamet`,
    description: 'E-post for tilbakestilling av passord (nn-NO)',
  },

  'email:order-confirmation': {
    subject: 'Ordrestadfesting - #{{orderId}}',
    content: `Hei {{name}},

Takk for bestillinga di!

Ordredetaljar:
- Ordre-ID: {{orderId}}
- Bestillingsdato: {{orderDate}}
{{#if totalAmount}}
- Totalt: {{totalAmount}} {{currency}}
{{/if}}

{{#if trackingNumber}}
Sporingsnummer: {{trackingNumber}}
{{/if}}

Vi varslar deg når ordren din blir sendt.

Beste helsing,
{{organizationName}}-teamet`,
    description: 'Stadfesting på bestilling (nn-NO)',
  },

  'email:order-shipped': {
    subject: 'Ordren din er sendt - #{{orderId}}',
    content: `Hei {{name}},

Gode nyhendar! Ordren din er sendt.

Ordredetaljar:
- Ordre-ID: {{orderId}}
{{#if trackingNumber}}
- Sporingsnummer: {{trackingNumber}}
{{/if}}
{{#if trackingUrl}}
- Spor pakken din: {{trackingUrl}}
{{/if}}

Estimert levering: {{estimatedDelivery}}

Beste helsing,
{{organizationName}}-teamet`,
    description: 'Varsel om sending av ordre (nn-NO)',
  },
};
