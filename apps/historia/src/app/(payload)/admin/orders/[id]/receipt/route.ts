import { headers } from 'next/headers';
import { getPayload } from 'payload';

import {
  formatOrderDate,
  getLineTotalMinor,
  getPriceExVatMinor,
  getPriceIncVatMinor,
  getProductName,
  getVatRate,
  toMajorUnits,
} from '@/lib/packing/orderHelpers';
import config from '@/payload.config';
import type { Order, Organization, User, Website } from '@/payload-types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payload = await getPayload({ config });

  // Check authentication
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });

  if (!user || !('roles' in user) || !user.roles?.includes('admin')) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Fetch the order with depth to get product and tenant details
  const order = await payload.findByID({
    collection: 'orders',
    id,
    depth: 3, // Need depth 3 to get website -> publisher -> organization details
  }) as Order;

  if (!order) {
    return new Response('Order not found', { status: 404 });
  }

  // Get customer name
  let customerName = '';
  if (order.customer && typeof order.customer === 'object') {
    const customer = order.customer as User;
    const firstName = customer.given_name || '';
    const lastName = customer.family_name || '';
    customerName = `${firstName} ${lastName}`.trim();
  }

  // Get organization details from tenant's publisher
  let organizationName = 'Historia';
  let organizationOrgNumber = '';
  let organizationEmail = '';
  let organizationPhone = '';
  let organizationAddress = '';

  if (order.tenant && typeof order.tenant === 'object') {
    const website = order.tenant as Website;
    organizationName = website.title || organizationName;

    // Get publisher organization details
    if (website.publisher && typeof website.publisher === 'object') {
      const org = website.publisher as Organization;
      organizationName = org.name || organizationName;
      organizationOrgNumber = org.organizationNumber || '';
      organizationEmail = org.email || '';
      organizationPhone = org.phone || '';

      // Format address
      if (org.address) {
        const addr = org.address;
        const parts = [
          addr.addressLine1,
          addr.addressLine2,
          [addr.postalCode, addr.city].filter(Boolean).join(' '),
          addr.country,
        ].filter(Boolean);
        organizationAddress = parts.join(', ');
      }
    }
  }

  const currency = order.currency || 'NOK';
  const items = order.items || [];

  // Calculate totals
  let totalExVat = 0;
  let totalVat = 0;
  let totalIncVat = 0;

  const itemRows = items.map((item, index) => {
    const productName = getProductName(item);
    const quantity = item.quantity || 1;
    const priceExVat = getPriceExVatMinor(item);
    const vatRate = getVatRate(item);
    const priceIncVat = getPriceIncVatMinor(item);
    const lineTotal = getLineTotalMinor(item);
    const lineTotalExVat = priceExVat * quantity;
    const lineVat = lineTotal - lineTotalExVat;

    totalExVat += lineTotalExVat;
    totalVat += lineVat;
    totalIncVat += lineTotal;

    return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${index + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${productName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${toMajorUnits(priceExVat).toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${vatRate}%</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${toMajorUnits(lineTotal).toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  const orderDate = formatOrderDate(order.createdAt, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const shippingAddress = order.shippingAddress;
  const shippingHtml = shippingAddress ? `
    <div style="margin-top: 24px;">
      <h3 style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Leveringsadresse</h3>
      <p style="margin: 0; line-height: 1.6;">
        ${shippingAddress.addressLine1 || ''}<br>
        ${shippingAddress.addressLine2 ? `${shippingAddress.addressLine2}<br>` : ''}
        ${shippingAddress.postalCode || ''} ${shippingAddress.city || ''}<br>
        ${shippingAddress.country || 'Norge'}
      </p>
    </div>
  ` : '';

  const html = `
<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kvittering - Ordre ${order.id}</title>
  <style>
    @media print {
      body { margin: 0; padding: 20px; }
      .no-print { display: none !important; }
      @page { margin: 1cm; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #1f2937;
      line-height: 1.5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      text-align: left;
      padding: 8px;
      border-bottom: 2px solid #374151;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      color: #6b7280;
    }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
    .print-button:hover {
      background: #2563eb;
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">🖨️ Skriv ut</button>

  <!-- Header -->
  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #374151; padding-bottom: 24px;">
    <div>
      <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">KVITTERING</h1>
      <p style="margin: 0; color: #6b7280; font-size: 14px;">Ordre #${order.id}</p>
    </div>
    <div style="text-align: right;">
      <p style="margin: 0; font-weight: 600; font-size: 18px;">${organizationName}</p>
      ${organizationOrgNumber ? `<p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">Org.nr: ${organizationOrgNumber}</p>` : ''}
      ${organizationAddress ? `<p style="margin: 4px 0 0 0; color: #6b7280; font-size: 13px;">${organizationAddress}</p>` : ''}
      ${organizationEmail ? `<p style="margin: 4px 0 0 0; color: #6b7280; font-size: 13px;">${organizationEmail}</p>` : ''}
      ${organizationPhone ? `<p style="margin: 4px 0 0 0; color: #6b7280; font-size: 13px;">${organizationPhone}</p>` : ''}
    </div>
  </div>

  <!-- Order info and customer -->
  <div style="display: flex; justify-content: space-between; margin-bottom: 32px;">
    <div>
      <h3 style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Kunde</h3>
      <p style="margin: 0; font-weight: 500;">${customerName || 'Ikke registrert'}</p>
      <p style="margin: 4px 0 0 0; color: #374151;">${order.userEmail}</p>
      ${shippingHtml}
    </div>
    <div style="text-align: right;">
      <h3 style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Ordredetaljer</h3>
      <p style="margin: 0;"><strong>Dato:</strong> ${orderDate}</p>
      <p style="margin: 4px 0 0 0;"><strong>Status:</strong> ${order.status}</p>
      <p style="margin: 4px 0 0 0;"><strong>Valuta:</strong> ${currency}</p>
    </div>
  </div>

  <!-- Items table -->
  <table style="margin-bottom: 24px;">
    <thead>
      <tr>
        <th style="width: 40px;">#</th>
        <th>Produkt</th>
        <th style="text-align: center; width: 60px;">Ant.</th>
        <th style="text-align: right; width: 100px;">Pris eks. MVA</th>
        <th style="text-align: center; width: 60px;">MVA</th>
        <th style="text-align: right; width: 100px;">Sum</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <!-- Totals -->
  <div style="margin-left: auto; width: 300px; border-top: 2px solid #374151; padding-top: 16px;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
      <span style="color: #6b7280;">Sum eks. MVA:</span>
      <span>${currency} ${toMajorUnits(totalExVat).toFixed(2)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
      <span style="color: #6b7280;">MVA:</span>
      <span>${currency} ${toMajorUnits(totalVat).toFixed(2)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px;">
      <span>Totalt:</span>
      <span>${currency} ${toMajorUnits(totalIncVat).toFixed(2)}</span>
    </div>
  </div>

  <!-- Footer -->
  <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">Denne kvitteringen er generert elektronisk og er gyldig uten signatur.</p>
    <p style="margin: 8px 0 0 0;">Generert: ${new Date().toLocaleString('nb-NO')}</p>
  </div>
</body>
</html>
  `.trim();

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
