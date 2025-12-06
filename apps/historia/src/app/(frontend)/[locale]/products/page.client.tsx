'use client';

import Link from 'next/link';

import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/format-price';
import type { Product } from '@/payload-types';

interface ProductsPageClientProps {
  products: Product[];
  locale: string;
}

export function ProductsPageClient({ products, locale }: ProductsPageClientProps) {
  const { addToCart, itemCount } = useCart();

  const handleAddToCart = (product: Product) => {
    addToCart(product.id, 1);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        {itemCount > 0 && (
          <Link
            href={`/${locale}/cart`}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>
              Cart ({itemCount})
            </span>
          </Link>
        )}
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-lg text-gray-600">No products available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex-1 p-4">
                <h3 className="mb-2 text-lg font-semibold">{product.title}</h3>

                {product.lead && (
                  <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                    {product.lead}
                  </p>
                )}

                {product.price?.amount && (
                  <div className="mb-4">
                    <span className="text-2xl font-bold">
                      {formatPrice(product.price.amount, product.price.currency || 'NOK', locale)}
                    </span>
                  </div>
                )}

                {product.inventory != null && (
                  <p className="mb-4 text-sm text-gray-500">
                    {product.inventory > 0
                      ? `${product.inventory} in stock`
                      : 'Out of stock'}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 p-4">
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.inventory === 0}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
