import type { Order } from '@/payload-types';

import {
  formatOrderDate,
  getLineTotalMinor,
  getPriceExVatMinor,
  getPriceIncVatMinor,
  getProductName,
  getVatRate,
  sanitizeForHtml,
  toMajorUnits,
} from './orderHelpers';

/**
 * Format packing list as plain text
 * Simple, readable format for email or printing
 */
export function formatPackingListAsText(order: Order, customerName?: string): string {
  const lines: string[] = [];

  // Header
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('                     PAKKELISTE / PACKING LIST');
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('');

  // Order info
  lines.push(`Ordre-ID:     ${order.id}`);
  lines.push(`Dato:         ${formatOrderDate(order.createdAt, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}`);
  lines.push(`Status:       ${order.status.toUpperCase()}`);
  lines.push('');

  // Customer info
  lines.push('KUNDE / CUSTOMER:');
  lines.push('───────────────────────────────────────────────────────────');
  if (customerName) {
    lines.push(`Navn:         ${customerName}`);
  }
  lines.push(`E-post:       ${order.userEmail}`);
  lines.push('');

  // Shipping address
  const shippingAddress = order.shippingAddress;
  if (shippingAddress) {
    lines.push('LEVERINGSADRESSE / SHIPPING ADDRESS:');
    lines.push('───────────────────────────────────────────────────────────');
    if (shippingAddress.addressLine1) {
      lines.push(`              ${shippingAddress.addressLine1}`);
    }
    if (shippingAddress.addressLine2) {
      lines.push(`              ${shippingAddress.addressLine2}`);
    }
    if (shippingAddress.postalCode && shippingAddress.city) {
      lines.push(`              ${shippingAddress.postalCode} ${shippingAddress.city}`);
    }
    if (shippingAddress.country) {
      lines.push(`              ${shippingAddress.country}`);
    }
    lines.push('');
  }

  // Items to pack
  lines.push('PRODUKTER Å PAKKE / ITEMS TO PACK:');
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('');

  const currency = order.currency ?? 'NOK';
  const items = order.items ?? [];

  items.forEach((item, index) => {
    const productName = getProductName(item);
    const quantity = item.quantity ?? 1;
    const priceExVat = getPriceExVatMinor(item);
    const vatRate = getVatRate(item);
    const priceIncVat = getPriceIncVatMinor(item);
    const lineTotal = getLineTotalMinor(item);

    lines.push(`${index + 1}. ${productName}`);
    lines.push(`   Antall:           ${quantity} stk`);
    lines.push(`   Pris eks. MVA:    ${currency} ${toMajorUnits(priceExVat).toFixed(2)}`);
    lines.push(`   MVA:              ${vatRate}%`);
    lines.push(`   Pris inkl. MVA:   ${currency} ${toMajorUnits(priceIncVat).toFixed(2)}`);
    lines.push(`   Linjetotal:       ${currency} ${toMajorUnits(lineTotal).toFixed(2)}`);
    lines.push('');
  });

  lines.push('───────────────────────────────────────────────────────────');
  lines.push(`TOTALT / TOTAL:       ${currency} ${toMajorUnits(order.totalAmount ?? 0).toFixed(2)}`);
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('');

  // Packing checklist
  lines.push('PAKKELISTE / PACKING CHECKLIST:');
  lines.push('───────────────────────────────────────────────────────────');
  items.forEach((item) => {
    lines.push(`☐ ${item.quantity ?? 1}x ${getProductName(item)}`);
  });
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════');

  return lines.join('\n');
}

/**
 * Format packing list as simple HTML
 * Clean, readable format for email
 */
export function formatPackingListAsHtml(order: Order, customerName?: string): string {
  const currency = order.currency ?? 'NOK';
  const orderItems = order.items ?? [];

  const items = orderItems.map((item, index) => {
    const productName = sanitizeForHtml(getProductName(item));
    const quantity = item.quantity ?? 1;
    const priceExVat = getPriceExVatMinor(item);
    const vatRate = getVatRate(item);
    const priceIncVat = getPriceIncVatMinor(item);
    const lineTotal = getLineTotalMinor(item);

    return `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 8px; text-align: left;">${index + 1}. ${productName}</td>
      <td style="padding: 12px 8px; text-align: center; font-weight: 600;">${quantity}</td>
      <td style="padding: 12px 8px; text-align: right;">${currency} ${toMajorUnits(priceExVat).toFixed(2)}</td>
      <td style="padding: 12px 8px; text-align: center;">${vatRate}%</td>
      <td style="padding: 12px 8px; text-align: right;">${currency} ${toMajorUnits(priceIncVat).toFixed(2)}</td>
      <td style="padding: 12px 8px; text-align: right; font-weight: 600;">${currency} ${toMajorUnits(lineTotal).toFixed(2)}</td>
    </tr>
  `;
  }).join('');

  const checklist = orderItems.map((item) => `
    <li style="margin-bottom: 8px;">☐ ${item.quantity ?? 1}x ${sanitizeForHtml(getProductName(item))}</li>
  `).join('');

  const shippingAddress = order.shippingAddress;
  const shippingHtml = shippingAddress ? `
    <div style="margin-bottom: 24px;">
      <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Leveringsadresse / Shipping Address</h3>
      <div style="padding: 12px; background: #f9fafb; border-radius: 6px; color: #374151;">
        ${sanitizeForHtml(shippingAddress.addressLine1)}<br>
        ${shippingAddress.addressLine2 ? `${sanitizeForHtml(shippingAddress.addressLine2)}<br>` : ''}
        ${sanitizeForHtml(shippingAddress.postalCode)} ${sanitizeForHtml(shippingAddress.city)}<br>
        ${sanitizeForHtml(shippingAddress.country) || 'NO'}
      </div>
    </div>
  ` : '';

  const orderDate = formatOrderDate(order.createdAt, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pakkeliste - ${order.id}</title>
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6; color: #1f2937;">
  <div style="max-width: 800px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background: #1f2937; color: white; padding: 24px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 600;">📦 Pakkeliste / Packing List</h1>
    </div>

    <!-- Content -->
    <div style="padding: 32px;">
      <!-- Order Info -->
      <div style="margin-bottom: 24px; padding: 16px; background: #f9fafb; border-left: 4px solid #3b82f6; border-radius: 4px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Ordre-ID:</td>
            <td style="padding: 4px 0; font-weight: 600; text-align: right;">${sanitizeForHtml(order.id)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Dato:</td>
            <td style="padding: 4px 0; text-align: right;">${orderDate}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Status:</td>
            <td style="padding: 4px 0; text-align: right;"><span style="padding: 4px 12px; background: #fef3c7; color: #92400e; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${sanitizeForHtml(order.status)}</span></td>
          </tr>
        </table>
      </div>

      <!-- Customer Info -->
      <div style="margin-bottom: 24px;">
        <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Kunde / Customer</h3>
        <div style="padding: 12px; background: #f9fafb; border-radius: 6px; color: #374151;">
          ${customerName ? `<strong>${sanitizeForHtml(customerName)}</strong><br>` : ''}
          ${sanitizeForHtml(order.userEmail)}
        </div>
      </div>

      ${shippingHtml}

      <!-- Items -->
      <div style="margin-bottom: 24px;">
        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Produkter å pakke / Items to Pack</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
          <thead>
            <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
              <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #374151;">Produkt</th>
              <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: #374151;">Ant.</th>
              <th style="padding: 12px 8px; text-align: right; font-weight: 600; color: #374151;">Pris eks. MVA</th>
              <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: #374151;">MVA</th>
              <th style="padding: 12px 8px; text-align: right; font-weight: 600; color: #374151;">Pris inkl. MVA</th>
              <th style="padding: 12px 8px; text-align: right; font-weight: 600; color: #374151;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items}
          </tbody>
          <tfoot>
            <tr style="border-top: 2px solid #374151; background: #f9fafb;">
              <td colspan="5" style="padding: 12px 8px; text-align: right; font-weight: 600;">TOTALT:</td>
              <td style="padding: 12px 8px; text-align: right; font-weight: 700; font-size: 16px;">${currency} ${toMajorUnits(order.totalAmount ?? 0).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Checklist -->
      <div style="padding: 16px; background: #f9fafb; border-radius: 6px;">
        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Pakkeliste / Packing Checklist</h3>
        <ul style="margin: 0; padding-left: 20px; list-style: none;">
          ${checklist}
        </ul>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
