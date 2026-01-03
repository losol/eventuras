/**
 * Locale-specific text for order shipped email template
 */
export interface OrderShippedTexts {
  headerTitle: string;
  greeting: string;
  shippedMessage: string;
  shipmentDetailsTitle: string;
  orderNumberLabel: string;
  trackingNumberLabel: string;
  trackingUrlLabel: string;
  estimatedDeliveryLabel: string;
  shippedProductsTitle: string;
  productColumn: string;
  quantityColumn: string;
  shippingAddressTitle: string;
  supportMessage: string;
  footerClosing: string;
}

/**
 * Shared CSS styles for order shipped email (reusing order confirmation styles with shipping-specific colors)
 */
export const ORDER_SHIPPED_STYLES = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
    .header .icon { font-size: 48px; margin-bottom: 15px; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .message { color: #666; margin-bottom: 30px; line-height: 1.8; }
    .shipment-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 4px; }
    .shipment-box h2 { margin: 0 0 15px 0; font-size: 20px; color: #333; }
    .shipment-details { margin: 0; padding: 0; list-style: none; }
    .shipment-details li { padding: 12px 0; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center; }
    .shipment-details li:last-child { border-bottom: none; }
    .shipment-details .label { color: #666; font-weight: 500; }
    .shipment-details .value { color: #333; font-weight: 600; }
    .tracking-link { display: inline-block; margin-top: 5px; padding: 10px 20px; background: #10b981; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; }
    .tracking-link:hover { background: #059669; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .items-table thead { background: #f8f9fa; }
    .items-table th { padding: 12px; text-align: left; font-weight: 600; color: #666; border-bottom: 2px solid #e9ecef; }
    .items-table td { padding: 12px; border-bottom: 1px solid #e9ecef; }
    .items-table tbody tr:last-child td { border-bottom: none; }
    .items-table .quantity { text-align: center; }
    .address-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px; }
    .address-box h2 { margin: 0 0 15px 0; font-size: 20px; color: #333; }
    .address-content { color: #333; line-height: 1.8; }
    .support-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px; }
    .support-box p { margin: 0; color: #78350f; }
    .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
    .footer-message { margin-bottom: 15px; }
    .organization { font-weight: 600; color: #10b981; }
`.trim();

/**
 * Build order shipped email template with locale-specific text
 */
export function buildOrderShippedTemplate(texts: OrderShippedTexts): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${ORDER_SHIPPED_STYLES}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon">📦</div>
      <h1>${texts.headerTitle}</h1>
    </div>
    <div class="content">
      <div class="greeting">${texts.greeting}</div>
      <div class="message">
        ${texts.shippedMessage}
      </div>

      <div class="shipment-box">
        <h2>🚚 ${texts.shipmentDetailsTitle}</h2>
        <ul class="shipment-details">
          <li>
            <span class="label">${texts.orderNumberLabel}:</span>
            <span class="value">#{{orderId}}</span>
          </li>
          {{#if trackingNumber}}
          <li>
            <span class="label">${texts.trackingNumberLabel}:</span>
            <span class="value">{{trackingNumber}}</span>
          </li>
          {{/if}}
          {{#if estimatedDelivery}}
          <li>
            <span class="label">${texts.estimatedDeliveryLabel}:</span>
            <span class="value">{{estimatedDelivery}}</span>
          </li>
          {{/if}}
        </ul>
        {{#if trackingUrl}}
        <div style="text-align: center; margin-top: 20px;">
          <a href="{{trackingUrl}}" class="tracking-link">${texts.trackingUrlLabel} →</a>
        </div>
        {{/if}}
      </div>

      {{#if items}}
      <div class="shipment-box">
        <h2>📋 ${texts.shippedProductsTitle}</h2>
        <table class="items-table">
          <thead>
            <tr>
              <th>${texts.productColumn}</th>
              <th class="quantity">${texts.quantityColumn}</th>
            </tr>
          </thead>
          <tbody>
            {{#each items}}
            <tr>
              <td>{{this.name}}</td>
              <td class="quantity">{{this.quantity}}</td>
            </tr>
            {{/each}}
          </tbody>
        </table>
      </div>
      {{/if}}

      {{#if shippingAddress}}
      <div class="address-box">
        <h2>📍 ${texts.shippingAddressTitle}</h2>
        <div class="address-content">
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

      <div class="support-box">
        <p>${texts.supportMessage}</p>
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
