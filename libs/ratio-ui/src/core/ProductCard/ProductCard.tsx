import React from 'react';
import { Card, CardProps } from '../Card/Card';
import { Button } from '../Button/Button';
import { Link } from '../Link/Link';

export interface ProductCardProps extends Omit<CardProps, 'children'> {
  /** Product title/name */
  title: string;
  /** Product lead/description text */
  lead?: string;
  /** Formatted price string (e.g. "kr 199,00") */
  price?: string;
  /** Product URL for navigation */
  href: string;
  /** Button click handler for add to cart */
  onAddToCart?: () => void;
  /** Button text, defaults to "Add to Cart" */
  buttonText?: string;
  /** Link component to use (e.g. Next.js Link) */
  linkComponent?: React.ElementType;
  /** Optional product image */
  image?: React.ReactNode;
  /** Test ID for the card */
  testId?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  title,
  lead,
  price,
  href,
  onAddToCart,
  buttonText,
  linkComponent,
  image,
  testId,
  ...cardProps
}) => {
  const finalButtonText = buttonText ?? 'Add to Cart';

  return (
    <Card
      {...cardProps}
      hoverEffect
      className="flex flex-col overflow-hidden"
      padding="none"
      data-testid={testId}
    >
      {/* Product Image (if provided) */}
      {image && <div className="w-full">{image}</div>}

      {/* Product Info - Clickable Link Area */}
      <Link
        href={href}
        component={linkComponent}
        className="flex-1 p-4 no-underline hover:no-underline"
        variant={undefined}
      >
        <h3 className="mb-2 text-lg font-semibold text-(--text) hover:text-(--primary) transition-colors">
          {title}
        </h3>

        {lead && (
          <p className="mb-4 text-sm text-(--text-muted) line-clamp-2">
            {lead}
          </p>
        )}

        {price && (
          <div className="mb-4">
            <span className="text-2xl font-bold text-(--text)">
              {price}
            </span>
          </div>
        )}
      </Link>

      {/* Action Button */}
      {onAddToCart && (
        <div className="border-t border-border-1 p-4">
          <Button
            onClick={onAddToCart}
            variant="primary"
            block
          >
            {finalButtonText}
          </Button>
        </div>
      )}
    </Card>
  );
};
