import type { CollectionAfterChangeHook } from 'payload';

import { Logger } from '@eventuras/logger';
import { notitiaTemplates } from '@eventuras/notitia-templates';

import { formatPhoneForDisplay } from '@/lib/utils/formatPhone';
import type { Order, Product, User, Website } from '@/payload-types';

const logger = Logger.create({
  namespace: 'historia:orders',
  context: { module: 'sendOrderStatus' },
});

/**
 * Hook to send order status emails:
 * - "order-received" when order is created (pending status)
 * - "order-confirmation" when payment is successful (status changes to processing)
 */
export const sendOrderStatus: CollectionAfterChangeHook<Order> = async ({
  doc,
  previousDoc,
  req,
  operation,
}) => {
  const { payload } = req;

  // Determine which email to send
  let shouldSendOrderReceived = false;
  let shouldSendOrderConfirmation = false;

  if (operation === 'create') {
    // Send "order-received" when order is created
    shouldSendOrderReceived = true;
    logger.info({ orderId: doc.id, status: doc.status }, 'Sending order received email (new order)');
  } else if (operation === 'update') {
    // Send "order-confirmation" when order status changes to 'processing' (successful payment)
    const isNewlyProcessing =
      doc.status === 'processing' && previousDoc?.status !== 'processing';

    if (isNewlyProcessing) {
      shouldSendOrderConfirmation = true;
      logger.info({ orderId: doc.id }, 'Sending order confirmation email (payment confirmed)');
    }
  }

  if (!shouldSendOrderReceived && !shouldSendOrderConfirmation) {
    logger.debug(
      {
        orderId: doc.id,
        operation,
        currentStatus: doc.status,
        previousStatus: previousDoc?.status,
      },
      'Skipping order emails - no trigger conditions met'
    );
    return doc;
  }

  try {

    // Get locale from request, fallback to CMS default
    const defaultLocale = (process.env.NEXT_PUBLIC_CMS_DEFAULT_LOCALE || 'no') as 'no' | 'en';
    const requestLocale = (req.locale || defaultLocale) as 'no' | 'en';
    // Map 'no' to 'nb-NO', 'en' to 'en-US'
    const emailLocale = requestLocale === 'no' ? 'nb-NO' : 'en-US';
    const salesEmailLocale = defaultLocale === 'no' ? 'nb-NO' : 'en-US';

    // Fetch the customer to get their name and phone
    let customerName = 'Kunde'; // Default fallback
    let customerPhone: string | undefined;
    if (doc.customer) {
      const customerId = typeof doc.customer === 'string' ? doc.customer : doc.customer.id;
      const customer = (await payload.findByID({
        collection: 'users',
        id: customerId,
      })) as User;

      const firstName = customer.given_name || '';
      const lastName = customer.family_name || '';
      customerName = `${firstName} ${lastName}`.trim() || customerName;
      customerPhone = customer.phone_number
        ? formatPhoneForDisplay(customer.phone_number)
        : undefined;

      logger.info(
        {
          customerId: customer.id,
          rawPhone: customer.phone_number,
          formattedPhone: customerPhone,
        },
        'Customer phone info',
      );
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
    const isTaxExempt = doc.taxExempt === true;
    const items = doc.items?.map((item) => {
      const product = item.product as Product;
      const quantity = item.quantity || 1;
      const priceExVat = item.price?.amountExVat || 0;
      const vatRate = isTaxExempt ? 0 : (item.price?.vatRate ?? 25);
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
      userEmail: doc.userEmail,
      phone: customerPhone,
      orderId: doc.id,
      orderDate: new Date(doc.createdAt).toLocaleDateString('nb-NO'),
      totalAmount: ((doc.totalAmount || 0) / 100).toFixed(2),
      currency: doc.currency || 'NOK',
      organizationName,
      items,
      taxExempt: isTaxExempt,
      taxExemptReason: doc.taxExemptReason,
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

    // Determine which template to use
    const templateType = shouldSendOrderReceived ? 'order-received' : 'order-confirmation';

    logger.info(
      {
        orderId: doc.id,
        templateType,
        hasPhone: !!templateData.phone,
        phoneValue: templateData.phone,
      },
      'Preparing to send email',
    );

    // Get locale-aware subject from template
    const emailSubject = notitiaTemplates.getSubject('email', templateType, templateData, {
      locale: emailLocale,
    });

    // Render the email template
    const emailHtml = notitiaTemplates.render('email', templateType, templateData, {
      locale: emailLocale,
    });

    // Send the email
    await payload.sendEmail({
      to: doc.userEmail,
      subject: emailSubject,
      html: emailHtml,
    });

    logger.info(
      { orderId: doc.id, email: doc.userEmail, templateType },
      `${shouldSendOrderReceived ? 'Order received' : 'Order confirmation'} email sent successfully`
    );

    // Send notification to sales contacts when new order is received
    if (shouldSendOrderReceived && salesEmails.length > 0) {
      try {
        // Render the sales notification email
        const salesEmailHtml = notitiaTemplates.render('email', 'order-received', {
          ...templateData,
          isCopy: true, // Show the copy banner for sales
        }, {
          locale: salesEmailLocale,
        });

        // Send to all sales contacts
        const salesSubject = notitiaTemplates.getSubject('email', 'order-received', {
          ...templateData,
          isCopy: true,
        }, {
          locale: salesEmailLocale,
        });

        for (const salesEmail of salesEmails) {
          await payload.sendEmail({
            to: salesEmail,
            subject: salesSubject,
            html: salesEmailHtml,
          });
        }

        logger.info(
          { orderId: doc.id, salesEmails, count: salesEmails.length },
          'New order notifications sent to sales successfully',
        );
      } catch (salesError) {
        logger.error(
          { error: salesError, orderId: doc.id, salesEmails },
          'Failed to send new order notifications to sales',
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
      'Failed to send order status email',
    );
    // Don't throw - we don't want to fail the order creation
  }

  return doc;
};
