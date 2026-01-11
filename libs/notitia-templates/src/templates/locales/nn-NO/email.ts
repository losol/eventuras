import type { TemplateRegistry } from '../../../types';
import { buildOrderStatusTemplate } from '../../utils/orderStatusBuilder';
import { buildOrderShippedTemplate } from '../../utils/orderShippedBuilder';

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

  'email:order-received': {
    subject: 'Bestilling mottatt - #{{orderId}}',
    content: buildOrderStatusTemplate({
      copyBanner: 'KOPI - Intern kopi av kundestadfesting',
      headerTitle: 'Bestilling mottatt',
      greeting: 'Hei {{name}}! 👋',
      thankYouMessage: 'Takk for bestillinga di! Vi har mottatt ordren din og vil behandle han så snart som mogleg.',
      orderDetailsTitle: 'Ordredetaljar',
      orderNumberLabel: 'Ordrenummer',
      orderDateLabel: 'Ordredato',
      customerEmailLabel: 'Kunde e-post',
      orderedProductsTitle: 'Bestilte produkt',
      productColumn: 'Produkt',
      quantityColumn: 'Tal',
      priceColumn: 'Pris',
      sumColumn: 'Sum',
      totalLabel: 'Totalt (inkl. mva)',
      totalLabelTaxExempt: 'Totalt (MVA-fritatt)',
      taxExemptLabel: 'MVA-fritatt',
      taxExemptReasonLabel: 'Årsak',
      shippingAddressTitle: 'Leveringsadresse',
      trackingNumberLabel: 'Sporingsnummer',
      shippingNotification: 'Vi varslar deg når betalinga er stadfesta og ordren din vert behandla.',
      footerClosing: 'Beste helsing',
    }),
    description: 'Stadfesting på mottatt bestilling (nn-NO)',
  },

  'email:order-confirmation': {
    subject: 'Ordrestadfesting - #{{orderId}}',
    content: buildOrderStatusTemplate({
      copyBanner: 'KOPI - Intern kopi av kundestadfesting',
      headerTitle: 'Ordrestadfesting',
      greeting: 'Hei {{name}}! 👋',
      thankYouMessage: 'Betalinga di er nå stadfesta og ordren din er under behandling. Vi startar å pakke varene dine snarest.',
      orderDetailsTitle: 'Ordredetaljar',
      orderNumberLabel: 'Ordrenummer',
      orderDateLabel: 'Ordredato',
      customerEmailLabel: 'Kunde e-post',
      orderedProductsTitle: 'Bestilte produkt',
      productColumn: 'Produkt',
      quantityColumn: 'Tal',
      priceColumn: 'Pris',
      sumColumn: 'Sum',
      totalLabel: 'Totalt (inkl. mva)',
      totalLabelTaxExempt: 'Totalt (MVA-fritatt)',
      taxExemptLabel: 'MVA-fritatt',
      taxExemptReasonLabel: 'Årsak',
      shippingAddressTitle: 'Leveringsadresse',
      trackingNumberLabel: 'Sporingsnummer',
      shippingNotification: 'Vi varslar deg når ordren din blir sendt.',
      footerClosing: 'Beste helsing',
    }),
    description: 'Stadfesting på bestilling etter betaling (nn-NO)',
  },

  'email:order-shipped': {
    subject: 'Ordren din er sendt - #{{orderId}}',
    content: buildOrderShippedTemplate({
      headerTitle: 'Ordren din er sendt! 🎉',
      greeting: 'Hei {{name}}! 👋',
      shippedMessage: 'Gode nyhendar! Ordren din har vorte sendt og er no på veg til deg. Du kan følgje med på leveringa med informasjonen nedanfor.',
      shipmentDetailsTitle: 'Sendingsdetaljar',
      orderNumberLabel: 'Ordrenummer',
      trackingNumberLabel: 'Sporingsnummer',
      trackingUrlLabel: 'Spor pakken din',
      estimatedDeliveryLabel: 'Estimert levering',
      shippedProductsTitle: 'Sendte produkt',
      productColumn: 'Produkt',
      quantityColumn: 'Tal',
      shippingAddressTitle: 'Leveringsadresse',
      supportMessage: '💬 Spørsmål om leveringa? Svar på denne e-posten så hjelper vi deg.',
      footerClosing: 'Med venleg helsing',
    }),
    description: 'Varsel om sending av ordre (nn-NO)',
  },
};
