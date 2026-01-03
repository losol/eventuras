import type { CollectionAfterChangeHook } from 'payload';

import { Logger } from '@eventuras/logger';
import { notitiaTemplates } from '@eventuras/notitia-templates';

import type { Order, Product, Shipment, User, Website } from '@/payload-types';

const logger = Logger.create({
  namespace: 'historia:shipments',
  context: { module: 'sendShipmentNotification' },
});

/**
 * Hook to send shipment notification email when a shipment status changes to 'shipped'
 */
export const sendShipmentNotification: CollectionAfterChangeHook<Shipment> = async ({
  doc,
  previousDoc,
  req: { payload },
}) => {
  // Only send email if status changed to 'shipped'
  if (doc.status !== 'shipped' || previousDoc?.status === 'shipped') {
    return doc;
  }

  try {
    logger.info({ shipmentId: doc.id, orderId: doc.order }, 'Sending shipment notification email');

    // Fetch the related order
    const orderId = typeof doc.order === 'string' ? doc.order : doc.order.id;
    const order = (await payload.findByID({
      collection: 'orders',
      id: orderId,
    })) as Order;

    // Fetch the customer to get their name
    let customerName = 'Kunde'; // Default fallback
    if (order.customer) {
      const customerId = typeof order.customer === 'string' ? order.customer : order.customer.id;
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
    if (order.tenant) {
      const tenantId = typeof order.tenant === 'string' ? order.tenant : order.tenant.id;
      const website = (await payload.findByID({
        collection: 'websites',
        id: tenantId,
      })) as Website;

      organizationName = website.title || organizationName;
    }

    // Build items list for email template
    const items =
      order.items?.map((item) => {
        const productName =
          typeof item.product === 'string'
            ? 'Product'
            : (item.product as Product)?.title || 'Product';
        return {
          name: productName,
          quantity: item.quantity,
        };
      }) || [];

    // Render the email template
    const emailHtml = notitiaTemplates.render('email', 'order-shipped', {
      name: customerName,
      orderId: order.id,
      trackingNumber: doc.trackingNumber || undefined,
      trackingUrl: doc.trackingUrl || undefined,
      estimatedDelivery: doc.deliveredAt
        ? new Date(doc.deliveredAt).toLocaleDateString('nb-NO')
        : undefined,
      organizationName,
      items: items.length > 0 ? items : undefined,
      shippingAddress: order.shippingAddress
        ? {
            addressLine1: order.shippingAddress.addressLine1,
            addressLine2: order.shippingAddress.addressLine2,
            postalCode: order.shippingAddress.postalCode,
            city: order.shippingAddress.city,
            country: order.shippingAddress.country,
          }
        : undefined,
    });

    // Send the email
    await payload.sendEmail({
      to: order.userEmail,
      subject: 'Din ordre er sendt!',
      html: emailHtml,
    });

    logger.info(
      {
        shipmentId: doc.id,
        orderId: order.id,
        email: order.userEmail,
      },
      'Shipment notification email sent successfully',
    );
  } catch (error) {
    logger.error(
      {
        error,
        shipmentId: doc.id,
        orderId: doc.order,
      },
      'Failed to send shipment notification email',
    );
    // Don't throw - we don't want to fail the shipment update
  }

  return doc;
};
