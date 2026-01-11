import type { TemplateRegistry } from '../../../types';
import { buildOrderStatusTemplate } from '../../utils/orderStatusBuilder';
import { buildOrderShippedTemplate } from '../../utils/orderShippedBuilder';

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

  'email:order-received': {
    subject: 'Bestilling mottatt - #{{orderId}}',
    content: buildOrderStatusTemplate({
      copyBanner: 'KOPI - Intern kopi av kundebekreftelse',
      headerTitle: 'Bestilling mottatt',
      greeting: 'Hei {{name}}! 👋',
      thankYouMessage: 'Takk for din bestilling! Vi har mottatt ordren din og vil behandle den så snart som mulig.',
      orderDetailsTitle: 'Ordredetaljer',
      orderNumberLabel: 'Ordrenummer',
      orderDateLabel: 'Ordredato',
      customerEmailLabel: 'Kunde e-post',
      customerPhoneLabel: 'Telefon',
      orderedProductsTitle: 'Bestilte produkter',
      productColumn: 'Produkt',
      quantityColumn: 'Antall',
      priceColumn: 'Pris',
      sumColumn: 'Sum',
      totalLabel: 'Totalt (inkl. mva)',
      totalLabelTaxExempt: 'Totalt (MVA-fritatt)',
      taxExemptLabel: 'MVA-fritatt',
      taxExemptReasonLabel: 'Årsak',
      shippingAddressTitle: 'Leveringsadresse',
      trackingNumberLabel: 'Sporingsnummer',
      shippingNotification: 'Vi vil sende deg en e-post når ordren din er bekreftet og klar for behandling.',
      footerClosing: 'Med vennlig hilsen',
    }),
    description: 'Bekreftelse på mottatt bestilling (nb-NO)',
  },

  'email:order-confirmation': {
    subject: 'Ordrebekreftelse - #{{orderId}}',
    content: buildOrderStatusTemplate({
      copyBanner: 'KOPI - Intern kopi av kundebekreftelse',
      headerTitle: 'Ordrebekreftelse',
      greeting: 'Hei {{name}}! 👋',
      thankYouMessage: 'Din betaling er nå bekreftet og ordren din er under behandling. Vi begynner å pakke varene dine snarest.',
      orderDetailsTitle: 'Ordredetaljer',
      orderNumberLabel: 'Ordrenummer',
      orderDateLabel: 'Ordredato',
      customerEmailLabel: 'Kunde e-post',
      customerPhoneLabel: 'Telefon',
      orderedProductsTitle: 'Bestilte produkter',
      productColumn: 'Produkt',
      quantityColumn: 'Antall',
      priceColumn: 'Pris',
      sumColumn: 'Sum',
      totalLabel: 'Totalt (inkl. mva)',
      totalLabelTaxExempt: 'Totalt (MVA-fritatt)',
      taxExemptLabel: 'MVA-fritatt',
      taxExemptReasonLabel: 'Årsak',
      shippingAddressTitle: 'Leveringsadresse',
      trackingNumberLabel: 'Sporingsnummer',
      shippingNotification: 'Vi vil sende deg en e-post når ordren din er sendt.',
      footerClosing: 'Med vennlig hilsen',
    }),
    description: 'Bekreftelse på bestilling etter betaling (nb-NO)',
  },

  'email:order-shipped': {
    subject: 'Din ordre er sendt - #{{orderId}}',
    content: buildOrderShippedTemplate({
      headerTitle: 'Ordren din er sendt! 🎉',
      greeting: 'Hei {{name}}! 👋',
      shippedMessage: 'Gode nyheter! Din ordre har blitt sendt og er nå på vei til deg. Du kan følge med på leveringen med informasjonen nedenfor.',
      shipmentDetailsTitle: 'Sendingsdetaljer',
      orderNumberLabel: 'Ordrenummer',
      trackingNumberLabel: 'Sporingsnummer',
      trackingUrlLabel: 'Spor pakken din',
      estimatedDeliveryLabel: 'Estimert levering',
      shippedProductsTitle: 'Sendte produkter',
      productColumn: 'Produkt',
      quantityColumn: 'Antall',
      shippingAddressTitle: 'Leveringsadresse',
      supportMessage: '💬 Spørsmål om din levering? Svar på denne e-posten så hjelper vi deg.',
      footerClosing: 'Med vennlig hilsen',
    }),
    description: 'Varsel om sending av ordre (nb-NO)',
  },
};
