'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { VippsExpressButton } from '@/components/payment/VippsExpressButton';
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
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading your cart...</span>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center">
          <svg
            className="mx-auto mb-4 h-16 w-16 text-gray-400 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <p className="mb-6 text-xl font-medium text-gray-900 dark:text-white">Your cart is empty</p>
          <p className="mb-6 text-gray-600 dark:text-gray-400">Start shopping to add items to your cart</p>
          <Link
            href={`/${locale}/products`}
            className="inline-block rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const cartWithProducts = items.map((item) => ({
    ...item,
    product: products.find((p) => p.id === item.productId),
  }));

  // Calculate total - price.amount is in NOK (kroner), convert to øre for Vipps
  const totalInCents = cartWithProducts.reduce((sum, item) => {
    const price = item.product?.price?.amount || 0;
    return sum + price * item.quantity * 100; // Convert NOK to øre
  }, 0);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
        <span className="rounded-full bg-blue-100 dark:bg-blue-900 px-4 py-1.5 text-sm font-medium text-blue-800 dark:text-blue-200">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="space-y-4">
        {cartWithProducts.map((item) => (
          <div
            key={item.productId}
            className="group relative flex items-center gap-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {item.product?.title || 'Product not found'}
              </h3>
              {item.product?.price?.amount && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatPrice(item.product.price.amount, item.product.price.currency || 'NOK', locale)} each
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-1">
              <button
                onClick={() =>
                  updateCartItem(item.productId, item.quantity - 1)
                }
                className="rounded px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={item.quantity <= 1}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-10 text-center font-medium text-gray-900 dark:text-white">{item.quantity}</span>
              <button
                onClick={() =>
                  updateCartItem(item.productId, item.quantity + 1)
                }
                className="rounded px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <div className="w-28 text-right">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {item.product?.price?.amount
                  ? formatPrice(
                      item.product.price.amount * item.quantity,
                      item.product.price.currency || 'NOK',
                      locale,
                    )
                  : '—'}
              </p>
            </div>

            <button
              onClick={() => removeFromCart(item.productId)}
              className="rounded-full p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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

      <div className="mt-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
          <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Total</span>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatPrice(totalInCents / 100, 'NOK', locale)}
          </span>
        </div>

        <div className="space-y-3">
          {/* Vipps Express Checkout */}
          <VippsExpressButton
            amount={totalInCents}
            currency="NOK"
            items={items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            }))}
            locale={locale}
          />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-gray-800 px-3 text-gray-500 dark:text-gray-400">or</span>
            </div>
          </div>


          <button
            onClick={clearCart}
            className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Clear Cart
          </button>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
