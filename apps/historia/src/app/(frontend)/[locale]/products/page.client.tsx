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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">No products available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-shadow hover:shadow-md"
            >
              <Link href={`/${locale}/products/${product.slug}`} className="flex-1 p-4">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                  {product.title}
                </h3>

                {product.lead && (
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {product.lead}
                  </p>
                )}

                {product.price?.amount && (
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(product.price.amount, product.price.currency || 'NOK', locale)}
                    </span>
                  </div>
                )}

                {product.inventory != null && (
                  <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    {product.inventory > 0
                      ? `${product.inventory} in stock`
                      : 'Out of stock'}
                  </p>
                )}
              </Link>

              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.inventory === 0}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-600 dark:disabled:text-gray-400"
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
