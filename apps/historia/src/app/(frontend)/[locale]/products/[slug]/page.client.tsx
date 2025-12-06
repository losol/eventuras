'use client';

import Link from 'next/link';

import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/format-price';
import type { Product } from '@/payload-types';

interface ProductDetailClientProps {
  product: Product;
  locale: string;
}

export function ProductDetailClient({ product, locale }: ProductDetailClientProps) {
  const { addToCart, items } = useCart();

  const handleAddToCart = () => {
    addToCart(product.id, 1);
  };

  const cartItem = items.find((item) => item.productId === product.id);
  const quantityInCart = cartItem?.quantity || 0;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link href={`/${locale}/products`} className="text-blue-600 hover:text-blue-700">
          ← Back to Products
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          {product.image && typeof product.image === 'object' && 'url' in product.image && product.image.url && typeof product.image.url === 'string' && (
            <img
              src={product.image.url}
              alt={product.title || ''}
              className="w-full rounded-lg border border-gray-200"
            />
          )}
        </div>

        <div>
          <h1 className="mb-4 text-3xl font-bold">{product.title}</h1>

          {product.lead && (
            <p className="mb-6 text-lg text-gray-700">{product.lead}</p>
          )}

          {product.price?.amount && (
            <div className="mb-6">
              <span className="text-3xl font-bold">
                {formatPrice(product.price.amount, product.price.currency || 'NOK', locale)}
              </span>
            </div>
          )}

          {product.inventory != null && (
            <p className="mb-6 text-sm text-gray-500">
              {product.inventory > 0
                ? `${product.inventory} in stock`
                : 'Out of stock'}
            </p>
          )}

          <div className="space-y-4">
            <button
              onClick={handleAddToCart}
              disabled={product.inventory === 0}
              className="w-full rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
            >
              {product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            {quantityInCart > 0 && (
              <div className="rounded-md bg-green-50 p-4 text-center">
                <p className="text-sm text-green-800">
                  {quantityInCart} {quantityInCart === 1 ? 'item' : 'items'} in cart
                </p>
                <Link
                  href={`/${locale}/cart`}
                  className="mt-2 inline-block text-sm text-green-700 underline hover:text-green-800"
                >
                  View Cart
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
