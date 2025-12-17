import type { CollectionAfterChangeHook } from 'payload';

import { Logger } from '@eventuras/logger';
import { notitiaTemplates } from '@eventuras/notitia-templates';

import type { Order, Product, User, Website } from '@/payload-types';

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
  req,
}) => {
  const { payload } = req;

  // Only send email when order status changes to 'processing' (successful payment)
  const isNewlyProcessing =
    doc.status === 'processing' && previousDoc?.status !== 'processing';

  if (!isNewlyProcessing) {
    return doc;
  }

  try {
    logger.info({ orderId: doc.id }, 'Sending order confirmation email');

    // Get locale from request, fallback to CMS default
    const defaultLocale = (process.env.NEXT_PUBLIC_CMS_DEFAULT_LOCALE || 'no') as 'no' | 'en';
    const requestLocale = (req.locale || defaultLocale) as 'no' | 'en';
    // Map 'no' to 'nb-NO', 'en' to 'en-US'
    const emailLocale = requestLocale === 'no' ? 'nb-NO' : 'en-US';
    const salesEmailLocale = defaultLocale === 'no' ? 'nb-NO' : 'en-US';

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
    const salesEmails: string[] = [];
    if (doc.tenant) {
      const tenantId = typeof doc.tenant === 'string' ? doc.tenant : doc.tenant.id;
      const website = (await payload.findByID({
        collection: 'websites',
        id: tenantId,
        depth: 2, // Populate user relationship in contactPoints
      })) as Website;

      organizationName = website.title || organizationName;

      // Get sales contact emails
      if (website.contactPoints) {
        const salesContacts = website.contactPoints.filter(
          (cp) => cp.contactType === 'sales',
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
    }

    // Prepare order items for email template
    const items = doc.items?.map((item) => {
      const product = item.product as Product;
      const quantity = item.quantity || 1;
      const priceExVat = item.price?.amountExVat || 0;
      const vatRate = item.price?.vatRate ?? 25;
      const priceIncVat = priceExVat * (1 + vatRate / 100);
      const lineTotal = quantity * priceIncVat;

      return {
        productTitle: product.title || 'Ukjent produkt',
        quantity,
        priceFormatted: (priceIncVat / 100).toFixed(2),
        lineTotalFormatted: (lineTotal / 100).toFixed(2),
        currency: item.price?.currency || 'NOK',
      };
    });

    // Prepare common template data
    const templateData = {
      name: customerName,
      orderId: doc.id,
      orderDate: new Date(doc.createdAt).toLocaleDateString('nb-NO'),
      totalAmount: ((doc.totalAmount || 0) / 100).toFixed(2),
      currency: doc.currency || 'NOK',
      organizationName,
      items,
      // Add shipping address
      shippingAddress: doc.shippingAddress
        ? {
            addressLine1: doc.shippingAddress.addressLine1,
            addressLine2: doc.shippingAddress.addressLine2,
            postalCode: doc.shippingAddress.postalCode,
            city: doc.shippingAddress.city,
            country: doc.shippingAddress.country,
          }
        : undefined,
    };

    // Render the email template
    const emailHtml = notitiaTemplates.render('email', 'order-confirmation', templateData, {
      locale: emailLocale,
    });

    // Send the email
    await payload.sendEmail({
      to: doc.userEmail,
      subject: `Ordrebekreftelse`,
      html: emailHtml,
    });

    logger.info({ orderId: doc.id, email: doc.userEmail }, 'Order confirmation email sent successfully');

    // Send notification email to sales contacts using same template with KOPI banner
    if (salesEmails.length > 0) {
      try {
        const salesEmailHtml = notitiaTemplates.render(
          'email',
          'order-confirmation',
          {
            ...templateData,
            isCopy: true, // This adds the KOPI banner
            userEmail: doc.userEmail, // Add customer email for internal copy
          },
          {
            locale: salesEmailLocale, // Use CMS default locale for internal notifications
          },
        );

        for (const salesEmail of salesEmails) {
          await payload.sendEmail({
            to: salesEmail,
            subject: `Ny ordre mottatt`,
            html: salesEmailHtml,
          });
        }

        logger.info(
          { orderId: doc.id, salesEmails, count: salesEmails.length },
          'Sales notification emails sent successfully',
        );
      } catch (salesError) {
        logger.error(
          { error: salesError, orderId: doc.id, salesEmails },
          'Failed to send sales notification emails',
        );
        // Don't throw - we don't want to fail if sales notification fails
      }
    }
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
