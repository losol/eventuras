import type { CollectionAfterChangeHook } from 'payload';

import { Logger } from '@eventuras/logger';
import { notitiaTemplates } from '@eventuras/notitia-templates';

import type { Order, User, Website } from '@/payload-types';

const logger = Logger.create({
  namespace: 'historia:orders',
  context: { module: 'sendOrderConfirmation' },
});

/**
 * Hook to send order confirmation email when payment is successful
 * (when order status changes to 'processing' after payment)
 */
export const sendOrderConfirmation: CollectionAfterChangeHook<Order> = async ({
  doc,
  previousDoc,
  req: { payload },
}) => {
  // Only send email when order status changes to 'processing' (successful payment)
  const isNewlyProcessing =
    doc.status === 'processing' && previousDoc?.status !== 'processing';

  if (!isNewlyProcessing) {
    return doc;
  }

  try {
    logger.info({ orderId: doc.id }, 'Sending order confirmation email');

    // Fetch the customer to get their name
    let customerName = 'Kunde'; // Default fallback
    if (doc.customer) {
      const customerId = typeof doc.customer === 'string' ? doc.customer : doc.customer.id;
      const customer = (await payload.findByID({
        collection: 'users',
        id: customerId,
      })) as User;

      const firstName = customer.given_name || '';
      const lastName = customer.family_name || '';
      customerName = `${firstName} ${lastName}`.trim() || customerName;
    }

    // Fetch the tenant/website for organization name
    let organizationName = 'Historia';
    if (doc.tenant) {
      const tenantId = typeof doc.tenant === 'string' ? doc.tenant : doc.tenant.id;
      const website = (await payload.findByID({
        collection: 'websites',
        id: tenantId,
      })) as Website;

      organizationName = website.title || organizationName;
    }

    // Render the email template
    const emailHtml = notitiaTemplates.render('email', 'order-confirmation', {
      name: customerName,
      orderId: doc.id,
      orderDate: new Date(doc.createdAt).toLocaleDateString('nb-NO'),
      totalAmount: ((doc.totalAmount || 0) / 100).toFixed(2),
      currency: doc.currency || 'NOK',
      organizationName,
    });

    // Send the email
    await payload.sendEmail({
      to: "ole@losol.no", // doc.userEmail,
      subject: `Ordrebekreftelse - #${doc.id}`,
      html: emailHtml,
    });

    logger.info({ orderId: doc.id, email: doc.userEmail }, 'Order confirmation email sent successfully');
  } catch (error) {
    logger.error(
      {
        error,
        orderId: doc.id,
        email: doc.userEmail,
      },
      'Failed to send order confirmation email',
    );
    // Don't throw - we don't want to fail the order creation
  }

  return doc;
};
