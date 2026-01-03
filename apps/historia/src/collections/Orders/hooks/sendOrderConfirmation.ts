import type { CollectionAfterChangeHook } from 'payload';

import { Logger } from '@eventuras/logger';
import { notitiaTemplates } from '@eventuras/notitia-templates';

import { createPackingNotifier } from '@/lib/packing';
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
    logger.debug(
      {
        orderId: doc.id,
        currentStatus: doc.status,
        previousStatus: previousDoc?.status,
      },
      'Skipping order confirmation - not newly processing'
    );
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

        logger.info(
          { websiteId: tenantId, salesContactsCount: salesContacts.length },
          'Found sales contacts for website'
        );

        for (const contact of salesContacts) {
          // Fetch user directly to get email (afterRead hook censors it from contactPoints)
          if (contact.user) {
            const userId = typeof contact.user === 'object' && 'id' in contact.user
              ? contact.user.id
              : contact.user;

            try {
              const user = (await payload.findByID({
                collection: 'users',
                id: userId as string,
              })) as User;

              if (user.email) {
                salesEmails.push(user.email);
                logger.debug({ email: user.email }, 'Added sales contact email');
              }
            } catch (error) {
              logger.error(
                { error, userId },
                'Failed to fetch sales contact user'
              );
            }
          }
        }
      } else {
        logger.info({ websiteId: tenantId }, 'No contactPoints found on website');
      }

      logger.info(
        { websiteId: tenantId, salesEmailsCount: salesEmails.length, salesEmails },
        'Sales emails to notify'
      );
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

    // Send packing list to sales contacts
    if (salesEmails.length > 0) {
      try {
        // Create notifier and send (easy to swap out email for other methods later)
        const notifier = createPackingNotifier(payload, 'email');
        await notifier.notify({
          targets: salesEmails.map(email => ({ email })),
          order: doc,
          customerName,
          locale: salesEmailLocale,
        });

        logger.info(
          { orderId: doc.id, salesEmails, count: salesEmails.length },
          'Packing list notifications sent successfully',
        );
      } catch (salesError) {
        logger.error(
          { error: salesError, orderId: doc.id, salesEmails },
          'Failed to send packing list notifications',
        );
        // Don't throw - we don't want to fail if packing notification fails
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
