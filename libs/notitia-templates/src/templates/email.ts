import type { TemplateRegistry } from '../types';
import { buildOrderStatusTemplate } from './utils/orderStatusBuilder';
import { buildOrderShippedTemplate } from './utils/orderShippedBuilder';

/**
 * Default email templates
 */
export const defaultEmailTemplates: TemplateRegistry = {
  'email:welcome': {
    subject: 'Welcome to {{organizationName}}',
    content: `Hello {{name}},

Welcome to {{organizationName}}! We're excited to have you join our community.

{{#if loginUrl}}
You can access your account at: {{loginUrl}}
{{/if}}

Best regards,
The {{organizationName}} Team`,
    description: 'Welcome email for new users',
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
    description: 'Event registration confirmation email',
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
    description: 'Event reminder email',
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
    description: 'Payment confirmation email',
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
    description: 'Password reset email',
  },

  'email:order-confirmation': {
    subject: 'Ordrebekreftelse - #{{orderId}}',
    content: buildOrderStatusTemplate({
      copyBanner: 'KOPI - Intern kopi av kundebekreftelse',
      headerTitle: 'Ordrebekreftelse',
      greeting: 'Hei {{name}}! 👋',
      thankYouMessage: 'Takk for din bestilling! Vi har mottatt ordren din og begynner å behandle den med en gang.',
      orderDetailsTitle: 'Ordredetaljer',
      orderNumberLabel: 'Ordrenummer',
      orderDateLabel: 'Ordredato',
      customerEmailLabel: 'Kunde e-post',
      orderedProductsTitle: 'Bestilte produkter',
      productColumn: 'Produkt',
      quantityColumn: 'Antall',
      priceColumn: 'Pris',
      sumColumn: 'Sum',
      totalLabel: 'Totalt (inkl. mva)',
      shippingAddressTitle: 'Leveringsadresse',
      trackingNumberLabel: 'Sporingsnummer',
      shippingNotification: 'Vi vil sende deg en epost når ordren din er sendt.',
      footerClosing: 'Med vennlig hilsen',
    }),
    description: 'Order confirmation email',
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
    description: 'Order shipped notification email',
  },

  'email:orphaned-payment-alert': {
    subject: '⚠️ KRITISK: Betaling godkjent uten ordre - {{paymentReference}}',
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .alert-banner { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .alert-content { background: #fff; border: 3px solid #dc2626; border-top: none; border-radius: 0 0 8px 8px; padding: 30px; }
    .detail-box { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-label { font-weight: 600; color: #6b7280; }
    .detail-value { color: #111827; }
    .action-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .action-title { color: #92400e; font-weight: 700; font-size: 16px; margin-bottom: 10px; }
    .action-steps { color: #92400e; margin: 10px 0 0 0; padding-left: 20px; }
    .footer { color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="alert-banner">
    <h1 style="margin: 0; font-size: 24px;">⚠️ KRITISK VARSEL</h1>
    <p style="margin: 10px 0 0 0; font-size: 14px;">Betaling godkjent - Ordre må opprettes manuelt</p>
  </div>

  <div class="alert-content">
    <h2>Hva har skjedd?</h2>
    <p>En kunde har fullført en betaling i Vipps, men systemet klarte ikke å opprette ordre automatisk på grunn av en teknisk feil (trolig cross-domain session-problem).</p>

    <p><strong>Dette krever rask manuell handling for å sikre at kunden får sine produkter!</strong></p>

    <div class="detail-box">
      <h3 style="margin-top: 0;">Betalingsdetaljer</h3>
      <div class="detail-row">
        <span class="detail-label">Referanse:</span>
        <span class="detail-value"><strong>{{paymentReference}}</strong></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Kunde e-post:</span>
        <span class="detail-value">{{customerEmail}}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Beløp:</span>
        <span class="detail-value"><strong>{{amount}} {{currency}}</strong></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status:</span>
        <span class="detail-value">{{paymentState}}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Tidspunkt:</span>
        <span class="detail-value">{{timestamp}}</span>
      </div>
    </div>

    <div class="action-box">
      <div class="action-title">📋 NØDVENDIGE HANDLINGER</div>
      <ol class="action-steps">
        <li>Logg inn i admin-panelet</li>
        <li>Finn betalingen med referanse: <strong>{{paymentReference}}</strong></li>
        <li>Verifiser betalingsdetaljer i Vipps API</li>
        <li>Opprett ordre manuelt basert på betalingsinformasjon</li>
        <li>Send ordrebekreftelse til kunden: {{customerEmail}}</li>
      </ol>
    </div>

    <h3>Teknisk informasjon</h3>
    <p><strong>Årsak:</strong> Cart unavailable in session (cross-domain session mismatch)</p>
    <p><strong>Business Event:</strong> payment.orphaned opprettet i systemet</p>
    <p><strong>{{vippsApiLink}}</strong></p>

    <div class="footer">
      <p><strong>{{organizationName}}</strong></p>
      <p>Dette er en automatisk generert varsling fra Historia betalingssystem.</p>
      <p>Hvis du har spørsmål om denne varslingen, kontakt systemadministrator.</p>
    </div>
  </div>
</body>
</html>`,
    description: 'Critical alert for orphaned payment (payment authorized but order not created)',
  },
};
