'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/format-price';
import type { Product } from '@/payload-types';

import { getCartProducts } from './actions';

interface CartPageClientProps {
  locale: string;
}

export function CartPageClient({ locale }: CartPageClientProps) {
  const { items, itemCount, updateCartItem, removeFromCart, clearCart } =
    useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      if (items.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const result = await getCartProducts(items.map((item) => item.productId));

      if (result.success) {
        setProducts(result.data);
      }
      setLoading(false);
    }

    loadProducts();
  }, [items]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="mb-4 text-lg text-gray-600">Your cart is empty</p>
          <Link
            href={`/${locale}/products`}
            className="inline-block rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const cartWithProducts = items.map((item) => ({
    ...item,
    product: products.find((p) => p.id === item.productId),
  }));

  const totalInCents = cartWithProducts.reduce((sum, item) => {
    const price = item.product?.price?.amount || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <span className="text-lg text-gray-600">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="space-y-4">
        {cartWithProducts.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex-1">
              <h3 className="font-semibold">
                {item.product?.title || 'Product not found'}
              </h3>
              {item.product?.price?.amount && (
                <p className="text-gray-600">
                  {formatPrice(item.product.price.amount, item.product.price.currency || 'NOK', locale)}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateCartItem(item.productId, item.quantity - 1)
                }
                className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-100"
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span className="w-12 text-center">{item.quantity}</span>
              <button
                onClick={() =>
                  updateCartItem(item.productId, item.quantity + 1)
                }
                className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-100"
              >
                +
              </button>
            </div>

            <div className="w-24 text-right font-semibold">
              {item.product?.price?.amount
                ? formatPrice(
                    item.product.price.amount * item.quantity,
                    item.product.price.currency || 'NOK',
                    locale,
                  )
                : '—'}
            </div>

            <button
              onClick={() => removeFromCart(item.productId)}
              className="text-red-600 hover:text-red-700"
              aria-label="Remove item"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between text-xl font-bold">
          <span>Total</span>
          <span>{formatPrice(totalInCents, 'NOK', locale)}</span>
        </div>

        <div className="space-y-2">
          <button className="w-full rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
            Proceed to Checkout
          </button>
          <button
            onClick={clearCart}
            className="w-full rounded-md border border-gray-300 px-6 py-3 hover:bg-gray-50"
          >
            Clear Cart
          </button>
        </div>
      </div>

      <div className="mt-4">
        <Link href={`/${locale}/products`} className="text-blue-600 hover:text-blue-700">
          ← Continue Shopping
        </Link>
      </div>
    </div>
  );
}
