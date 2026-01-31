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

  'email:otp-login': {
    subject: '{{appName}} - Din innloggingskode',
    content: `<!DOCTYPE html>
<html lang="nn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{appName}} - Innloggingskode</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 32px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px; font-weight: 600;">{{appName}} - Innloggingskode</h1>
    </div>

    <!-- Content -->
    <div style="padding: 40px 32px; text-align: center;">
      <p style="font-size: 16px; color: #374151; margin: 0 0 24px 0;">
        Din eingangskode for innlogging er:
      </p>

      <!-- OTP Code -->
      <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border: 2px solid #667eea; border-radius: 8px; padding: 24px; margin: 0 0 24px 0;">
        <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace;">
          {{code}}
        </div>
      </div>

      <p style="font-size: 14px; color: #6b7280; margin: 0 0 32px 0;">
        Denne koden går ut om <strong>{{expiresInMinutes}} minuttar</strong>.
      </p>

      <!-- Security Notice -->
      <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; text-align: left; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #92400e;">
          <strong>🔒 Sikkerheitsvarsel:</strong><br>
          Dersom du ikkje ba om denne koden, kan du trygt ignorere denne e-posten. Nokon kan ha oppgitt e-postadressa di ved ein feil.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
        Denne e-posten vart sendt frå {{appName}}<br>
        Del aldri innloggingskoden din med andre.
      </p>
    </div>
  </div>
</body>
</html>`,
    description: 'OTP innloggingskode e-post (nn-NO)',
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
