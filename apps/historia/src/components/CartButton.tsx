'use client';

import { useEffect, useState } from 'react';

import { useCart } from '@/lib/cart';

import { CartDrawer } from './cart/CartDrawer';

interface CartButtonProps {
  locale: string;
}

export function CartButton({ locale }: CartButtonProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { itemCount } = useCart();

  // Prevent hydration mismatch by only showing count after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="relative rounded-md p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Åpne handlekurv"
      >
        {/* Shopping cart icon */}
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>

        {/* Item count badge - only show after mount to prevent hydration mismatch */}
        {isMounted && itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
            {itemCount > 9 ? '9+' : itemCount}
          </span>
        )}
      </button>

      <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} locale={locale} />
    </>
  );
}
