import React, { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface NavbarProps {
  children?: ReactNode;
  /** Forces white text for dark backgrounds. */
  bgDark?: boolean;
  /** Tailwind background class (default `bg-transparent`). */
  bgColor?: string;
  /** Make navbar sticky at the top. */
  sticky?: boolean;
  className?: string;

  // ── Legacy shorthand props (still supported, prefer Navbar.Brand) ──

  /** @deprecated Use `<Navbar.Brand>` instead. */
  title?: string;
  /** @deprecated Use `<Navbar.Brand>` instead. */
  titleHref?: string;
  /** @deprecated Use `<Navbar.Brand>` instead. */
  LinkComponent?: React.ComponentType<{
    href: string;
    children: ReactNode;
    className?: string;
  }>;
}

export interface NavbarBrandProps {
  children?: ReactNode;
  className?: string;
}

export interface NavbarContentProps {
  children?: ReactNode;
  className?: string;
}

function NavbarBrand({ children, className }: Readonly<NavbarBrandProps>) {
  return (
    <div className={cn('flex shrink-0 items-center text-[var(--navbar-color,inherit)]', className)}>
      {children}
    </div>
  );
}

function NavbarContent({ children, className }: Readonly<NavbarContentProps>) {
  return (
    <div className={cn('flex grow items-center gap-3 text-[var(--navbar-color,inherit)]', className)}>
      {children}
    </div>
  );
}

const NavbarRoot = ({
  children,
  bgDark = false,
  bgColor,
  sticky = false,
  className,
  // eslint-disable-next-line deprecation/deprecation -- backward-compat bridge
  title,
  // eslint-disable-next-line deprecation/deprecation -- backward-compat bridge
  titleHref = '/',
  // eslint-disable-next-line deprecation/deprecation -- backward-compat bridge
  LinkComponent,
}: Readonly<NavbarProps>) => {
  const textColor = bgDark ? 'text-light' : 'text-dark dark:text-light';
  const positionClass = sticky ? 'sticky top-0 z-50' : '';
  // CSS custom property so Brand/Content get the resolved color without
  // React context (which would require 'use client').
  const navbarColorVar = bgDark
    ? '[--navbar-color:white]'
    : '[--navbar-color:var(--text-dark,#1a1a1a)] dark:[--navbar-color:var(--text-light,white)]';

  const hasLegacyTitle = typeof title === 'string' && title !== '';
  const LinkTag = LinkComponent ?? ('a' as React.ElementType);

  return (
    <nav className={cn(bgColor, positionClass, textColor, navbarColorVar, 'm-0 p-0', className)}>
      <div
        className={cn(
          'flex flex-wrap items-center mx-auto gap-3 py-2 px-3',
          hasLegacyTitle && 'justify-between',
        )}
      >
        {hasLegacyTitle && (
          <NavbarBrand>
            <LinkTag
              href={titleHref}
              className={cn('text-lg tracking-tight whitespace-nowrap no-underline', textColor)}
            >
              {title}
            </LinkTag>
          </NavbarBrand>
        )}
        {children}
      </div>
    </nav>
  );
};

export const Navbar = Object.assign(NavbarRoot, {
  Brand: NavbarBrand,
  Content: NavbarContent,
});
