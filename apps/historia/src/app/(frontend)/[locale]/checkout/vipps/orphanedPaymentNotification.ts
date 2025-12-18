'use server';

import { getPayload } from 'payload';

import {
  actionError,
  actionSuccess,
  ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';
import { notitiaTemplates } from '@eventuras/notitia-templates';

import { getCurrentWebsiteId } from '@/lib/website';
import config from '@/payload.config';
import type { Website } from '@/payload-types';

const logger = Logger.create({
  namespace: 'historia:checkout:vipps',
  context: { module: 'orphanedPaymentNotification' },
});

interface OrphanedPaymentDetails {
  paymentReference: string;
  customerEmail?: string;
  amount: number;
  currency: string;
  paymentState: string;
}

/**
 * Create business event and send email notification for orphaned payment
 *
 * This is called when a payment is authorized in Vipps but the cart is unavailable
 * in the session (e.g., cross-domain session issue). It creates a business event
 * for tracking and sends an email to sales contacts for manual intervention.
 *
 * @param details - Details about the orphaned payment
 * @returns Success or error result
 */
export async function notifyOrphanedPayment(
  details: OrphanedPaymentDetails
): Promise<ServerActionResult<void>> {
  try {
    const { paymentReference, customerEmail, amount, currency, paymentState } = details;

    logger.info(
      { paymentReference, customerEmail, amount },
      'Creating orphaned payment notification'
    );

    const payload = await getPayload({ config });

    // Create business event for tracking
    await payload.create({
      collection: 'business-events',
      data: {
        eventType: 'payment.orphaned',
        source: 'vipps',
        externalReference: paymentReference,
        data: {
          reference: paymentReference,
          customerEmail,
          amount,
          currency,
          paymentState,
          timestamp: new Date().toISOString(),
          reason: 'cart_unavailable_session_mismatch',
          requiresManualIntervention: true,
        },
      },
    });

    logger.info({ paymentReference }, 'Business event created for orphaned payment');

    // Get current website/tenant for sales contact emails
    const websiteId = await getCurrentWebsiteId();
    if (!websiteId) {
      logger.warn(
        { paymentReference },
        'No website context found, cannot send sales notification'
      );
      return actionSuccess(undefined);
    }

    const website = (await payload.findByID({
      collection: 'websites',
      id: websiteId,
      depth: 2, // Populate user relationship in contactPoints
    })) as Website;

    // Get sales contact emails
    const salesEmails: string[] = [];
    if (website.contactPoints) {
      const salesContacts = website.contactPoints.filter(
        (cp) => cp.contactType === 'sales'
      );

      for (const contact of salesContacts) {
        if (contact.user && typeof contact.user === 'object' && 'email' in contact.user) {
          const userEmail = contact.user.email;
          if (userEmail) {
            salesEmails.push(userEmail);
          }
        }
      }
    }

    if (salesEmails.length === 0) {
      logger.warn(
        { paymentReference, websiteId },
        'No sales contact emails found for website'
      );
      return actionSuccess(undefined);
    }

    // Prepare email template data
    const locale = (process.env.NEXT_PUBLIC_CMS_DEFAULT_LOCALE || 'no') === 'no' ? 'nb-NO' : 'en-US';
    const amountFormatted = (amount / 100).toFixed(2);
    const timestamp = new Date().toLocaleString('nb-NO');

    const templateData = {
      paymentReference,
      customerEmail: customerEmail || 'Ikke tilgjengelig',
      amount: amountFormatted,
      currency,
      paymentState,
      timestamp,
      organizationName: website.title || 'Historia',
      actionRequired: 'Opprett ordre manuelt i admin-panel basert på betalingsreferanse',
      vippsApiLink: `Vipps API: epayment/${paymentReference}`,
    };

    // Render email using template
    const emailHtml = notitiaTemplates.render(
      'email',
      'orphaned-payment-alert',
      templateData,
      { locale }
    );

    // Send email to all sales contacts
    for (const email of salesEmails) {
      try {
        await payload.sendEmail({
          to: email,
          subject: `⚠️ KRITISK: Betaling godkjent uten ordre - ${paymentReference}`,
          html: emailHtml,
        });

        logger.info(
          { paymentReference, recipient: email },
          'Orphaned payment notification sent to sales contact'
        );
      } catch (emailError) {
        logger.error(
          { paymentReference, recipient: email, error: emailError },
          'Failed to send orphaned payment notification email'
        );
      }
    }

    logger.info(
      { paymentReference, recipientCount: salesEmails.length },
      'Orphaned payment notifications sent successfully'
    );

    return actionSuccess(undefined);
  } catch (error) {
    logger.error(
      { paymentReference: details.paymentReference, error },
      'Failed to create orphaned payment notification'
    );

    return actionError(
      error instanceof Error ? error.message : 'Failed to create notification'
    );
  }
}
