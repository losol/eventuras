'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Navbar } from '@eventuras/ratio-ui/core/Navbar';

import { CartButton } from '@/components/CartButton';
import { Logo } from '@/components/Logo/Logo';
import { useHeaderTheme } from '@/providers/HeaderTheme';

export const HeaderClient: React.FC = () => {
  const [theme, setTheme] = useState<string | null>(null);
  const { headerTheme, setHeaderTheme } = useHeaderTheme();
  const pathname = usePathname();

  // Extract locale from pathname (e.g., /no/products -> 'no')
  const locale = pathname.split('/')[1] || 'no';

  useEffect(() => {
    if (headerTheme !== null) {
      setHeaderTheme(null);
    }
  }, [pathname, headerTheme, setHeaderTheme]);

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) {
      // Use setTimeout to avoid setState in render
      setTimeout(() => setTheme(headerTheme), 0);
    }
  }, [headerTheme, theme]);

  return (
    <header className={`relative z-20 ${theme ? `data-theme=${theme}` : ''}`}>
      <Navbar
        titleHref="/"
        LinkComponent={Link}
        bgColor="bg-transparent"
      >
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>
        <CartButton locale={locale} />
      </Navbar>
    </header>
  );
};
