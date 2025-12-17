/**
 * Locale-specific text for order confirmation email template
 */
export interface OrderConfirmationTexts {
  copyBanner: string;
  headerTitle: string;
  greeting: string;
  thankYouMessage: string;
  orderDetailsTitle: string;
  orderNumberLabel: string;
  orderDateLabel: string;
  customerEmailLabel: string;
  orderedProductsTitle: string;
  productColumn: string;
  quantityColumn: string;
  priceColumn: string;
  sumColumn: string;
  totalLabel: string;
  shippingAddressTitle: string;
  trackingNumberLabel: string;
  shippingNotification: string;
  footerClosing: string;
}

/**
 * Shared CSS styles for order confirmation email
 */
export const ORDER_CONFIRMATION_STYLES = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .copy-banner { background: #ffc107; color: #000; padding: 15px 30px; text-align: center; font-weight: 600; font-size: 14px; letter-spacing: 1px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .message { color: #666; margin-bottom: 30px; }
    .order-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px; }
    .order-box h2 { margin: 0 0 15px 0; font-size: 20px; color: #333; }
    .order-details { margin: 0; padding: 0; list-style: none; }
    .order-details li { padding: 8px 0; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; }
    .order-details li:last-child { border-bottom: none; }
    .order-details .label { color: #666; }
    .order-details .value { color: #333; font-weight: 500; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .items-table thead { background: #f8f9fa; }
    .items-table th { padding: 12px; text-align: left; font-weight: 600; color: #666; border-bottom: 2px solid #e9ecef; }
    .items-table td { padding: 12px; border-bottom: 1px solid #e9ecef; }
    .items-table tbody tr:last-child td { border-bottom: none; }
    .items-table .quantity { text-align: center; }
    .items-table .price { text-align: right; }
    .total-row { font-weight: 600; font-size: 18px; color: #667eea; padding-top: 15px !important; }
    .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
    .footer-message { margin-bottom: 15px; }
    .organization { font-weight: 600; color: #667eea; }
`.trim();

/**
 * Build order confirmation email template with locale-specific text
 */
export function buildOrderConfirmationTemplate(texts: OrderConfirmationTexts): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${ORDER_CONFIRMATION_STYLES}
  </style>
</head>
<body>
  <div class="container">
    {{#if isCopy}}
    <div class="copy-banner">📋 ${texts.copyBanner}</div>
    {{/if}}
    <div class="header">
      <h1>${texts.headerTitle}</h1>
    </div>
    <div class="content">
      <div class="greeting">${texts.greeting}</div>
      <div class="message">
        ${texts.thankYouMessage}
      </div>

      <div class="order-box">
        <h2>📦 ${texts.orderDetailsTitle}</h2>
        <ul class="order-details">
          <li>
            <span class="label">${texts.orderNumberLabel}:</span>
            <span class="value">#{{orderId}}</span>
          </li>
          <li>
            <span class="label">${texts.orderDateLabel}:</span>
            <span class="value">{{orderDate}}</span>
          </li>
          {{#if userEmail}}
          <li>
            <span class="label">${texts.customerEmailLabel}:</span>
            <span class="value">{{userEmail}}</span>
          </li>
          {{/if}}
        </ul>

        {{#if items}}
        <h2 style="margin-top: 30px; margin-bottom: 15px; font-size: 18px; color: #333;">🛒 ${texts.orderedProductsTitle}</h2>
        <table class="items-table">
          <thead>
            <tr>
              <th>${texts.productColumn}</th>
              <th class="quantity">${texts.quantityColumn}</th>
              <th class="price">${texts.priceColumn}</th>
              <th class="price">${texts.sumColumn}</th>
            </tr>
          </thead>
          <tbody>
            {{#each items}}
            <tr>
              <td>{{this.productTitle}}</td>
              <td class="quantity">{{this.quantity}}</td>
              <td class="price">{{this.priceFormatted}} {{this.currency}}</td>
              <td class="price">{{this.lineTotalFormatted}} {{this.currency}}</td>
            </tr>
            {{/each}}
            <tr>
              <td colspan="3" class="total-row" style="text-align: right; padding-right: 12px;">${texts.totalLabel}:</td>
              <td class="price total-row">{{totalAmount}} {{currency}}</td>
            </tr>
          </tbody>
        </table>
        {{else}}
        {{#if totalAmount}}
        <ul class="order-details" style="margin-top: 20px;">
          <li>
            <span class="label">${texts.totalLabel}:</span>
            <span class="value" style="font-weight: 600; font-size: 18px; color: #667eea;">{{totalAmount}} {{currency}}</span>
          </li>
        </ul>
        {{/if}}
        {{/if}}
      </div>

      {{#if shippingAddress}}
      <div class="order-box">
        <h2>📍 ${texts.shippingAddressTitle}</h2>
        <div style="color: #333; line-height: 1.8;">
          {{#if shippingAddress.addressLine1}}
          {{shippingAddress.addressLine1}}<br>
          {{/if}}
          {{#if shippingAddress.addressLine2}}
          {{shippingAddress.addressLine2}}<br>
          {{/if}}
          {{#if shippingAddress.postalCode}}{{shippingAddress.postalCode}}{{/if}}{{#if shippingAddress.city}} {{shippingAddress.city}}{{/if}}<br>
          {{#if shippingAddress.country}}
          {{shippingAddress.country}}
          {{/if}}
        </div>
      </div>
      {{/if}}

      <div class="message">
        {{#if trackingNumber}}
        <strong>${texts.trackingNumberLabel}:</strong> {{trackingNumber}}<br><br>
        {{else}}
        ${texts.shippingNotification}
        {{/if}}
      </div>
    </div>
    <div class="footer">
      <div class="footer-message">
        ${texts.footerClosing}<br>
        <span class="organization">{{organizationName}}</span>
      </div>
    </div>
  </div>
</body>
</html>`;
}
