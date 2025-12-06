'use client';

import Link from 'next/link';

import { useCart } from '@/lib/cart';

interface CartButtonProps {
  locale: string;
}

export function CartButton({ locale }: CartButtonProps) {
  const { itemCount } = useCart();

  if (itemCount === 0) {
    return null;
  }

  return (
    <Link
      href={`/${locale}/cart`}
      className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
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
      <span>Cart ({itemCount})</span>
    </Link>
  );
}
