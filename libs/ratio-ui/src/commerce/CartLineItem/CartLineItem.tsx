import React from 'react';

export interface CartLineItemData {
  productId: string;
  title: string;
  quantity: number;
  pricePerUnitIncVat: number;
  vatAmount: number;
  lineTotalIncVat: number;
  currency: string;
}

export interface CartLineItemProps {
  /** Line item data */
  item: CartLineItemData;
  /** Locale for price formatting */
  locale: string;
  /** Format price function */
  formatPrice: (amount: number, currency: string, locale: string) => string;
  /** Whether to show quantity controls */
  showQuantityControls?: boolean;
  /** Quantity change handler */
  onQuantityChange?: (productId: string, quantity: number) => void;
  /** Remove handler */
  onRemove?: (productId: string) => void;
  /** Test ID prefix */
  testIdPrefix?: string;
  /** Quantity field component (optional for customization) */
  QuantityField?: React.ComponentType<{
    value: number;
    minValue: number;
    onChange: (value: number) => void;
    decrementAriaLabel: string;
    incrementAriaLabel: string;
    'aria-label': string;
    testId?: string;
  }>;
}

/**
 * CartLineItem - Display a single cart line item with optional quantity controls
 *
 * @example
 * ```tsx
 * import { CartLineItem } from '@eventuras/ratio-ui/commerce/CartLineItem';
 * import { formatPrice } from '@eventuras/core/currency';
 * import { NumberField } from '@eventuras/ratio-ui/forms';
 *
 * <CartLineItem
 *   item={lineItem}
 *   locale="nb"
 *   formatPrice={formatPrice}
 *   showQuantityControls
 *   onQuantityChange={(id, qty) => updateCart(id, qty)}
 *   onRemove={(id) => removeFromCart(id)}
 *   QuantityField={NumberField}
 * />
 * ```
 */
export const CartLineItem: React.FC<CartLineItemProps> = ({
  item,
  locale,
  formatPrice,
  showQuantityControls = false,
  onQuantityChange,
  onRemove,
  testIdPrefix = 'cart-item',
  QuantityField,
}) => {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {item.title}
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {item.quantity} x {formatPrice(item.pricePerUnitIncVat, item.currency, locale)}
          {' '}(inkl mva {formatPrice(item.vatAmount, item.currency, locale)})
        </p>

        {showQuantityControls && QuantityField && onQuantityChange && (
          <div className="mt-2">
            <QuantityField
              value={item.quantity}
              minValue={0}
              onChange={(nextQuantity: number) => {
                if (nextQuantity === 0 && onRemove) {
                  onRemove(item.productId);
                  return;
                }
                onQuantityChange(item.productId, nextQuantity);
              }}
              decrementAriaLabel="Reduser antall"
              incrementAriaLabel="Øk antall"
              aria-label="Antall"
              testId={`${testIdPrefix}-quantity-${item.productId}`}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col items-end justify-between">
        {showQuantityControls && onRemove && (
          <button
            onClick={() => onRemove(item.productId)}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Fjern
          </button>
        )}
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
            {formatPrice(item.lineTotalIncVat, item.currency, locale)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            inkl. mva
          </p>
        </div>
      </div>
    </div>
  );
};
