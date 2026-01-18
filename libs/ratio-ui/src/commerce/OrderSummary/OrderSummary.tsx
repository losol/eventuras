import React from 'react';

import { Heading } from '../../core/Heading';
import type { CartLineItemData } from '../CartLineItem';

export interface OrderSummaryData {
  items: CartLineItemData[];
  subtotalExVat: number;
  totalVat: number;
  totalIncVat: number;
  currency: string;
}

export interface OrderSummaryProps {
  /** Order summary data */
  summary: OrderSummaryData;
  /** Locale for price formatting */
  locale: string;
  /** Format price function */
  formatPrice: (amount: number, currency: string, locale: string) => string;
  /** Title for the summary card */
  title?: string;
  /** Whether to show VAT breakdown */
  showVatBreakdown?: boolean;
  /** Children to render line items (for customization) */
  children?: React.ReactNode;
}

/**
 * OrderSummary - Display order totals and summary
 *
 * @example
 * ```tsx
 * import { OrderSummary } from '@eventuras/ratio-ui/commerce/OrderSummary';
 * import { CartLineItem } from '@eventuras/ratio-ui/commerce/CartLineItem';
 * import { formatPrice } from '@eventuras/core/currency';
 *
 * <OrderSummary
 *   summary={cartSummary}
 *   locale="nb"
 *   formatPrice={formatPrice}
 *   title="Ordresammendrag"
 *   showVatBreakdown
 * >
 *   {cartSummary.items.map(item => (
 *     <CartLineItem key={item.productId} item={item} ... />
 *   ))}
 * </OrderSummary>
 * ```
 */
export const OrderSummary: React.FC<OrderSummaryProps> = ({
  summary,
  locale,
  formatPrice,
  title = 'Ordresammendrag',
  showVatBreakdown = false,
  children,
}) => {
  return (
    <>
      <Heading as="h2" padding="pb-4">
        {title}
      </Heading>

      {/* Items */}
      {children && (
        <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          {children}
        </div>
      )}

      {/* Summary */}
      <div className="space-y-2">
        {showVatBreakdown && (
          <>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Subtotal (eks. mva)</span>
              <span>{formatPrice(summary.subtotalExVat, summary.currency, locale)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>MVA</span>
              <span>{formatPrice(summary.totalVat, summary.currency, locale)}</span>
            </div>
          </>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatPrice(summary.totalIncVat, summary.currency, locale)}
          </span>
        </div>
      </div>
    </>
  );
};
