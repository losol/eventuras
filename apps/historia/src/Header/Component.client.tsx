'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { Logo } from '@/components/Logo/Logo'

export const HeaderClient: React.FC = () => {
  const [theme, setTheme] = useState<string | null>(null);
  const { headerTheme, setHeaderTheme } = useHeaderTheme();
  const pathname = usePathname();

  useEffect(() => {
    if (headerTheme !== null) {
      setHeaderTheme(null);
    }
  }, [pathname, headerTheme]);

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) {
      setTheme(headerTheme);
    }
  }, [headerTheme, theme]);

  return (
    <header className={`container relative z-20 ${theme ? `data-theme=${theme}` : ''}`}>
      <div className="py-8 flex justify-between">
        <Link href="/">
          <Logo className="invert dark:invert-0" />
        </Link>
      </div>
    </header>
  );
};
