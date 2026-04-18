import React, { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface NavbarProps {
  children?: ReactNode;
  /** Forces white text for dark backgrounds. */
  bgDark?: boolean;
  /** Tailwind background class (default `bg-transparent`). */
  bgColor?: string;
  /** Make navbar sticky at the top. Ignored when `overlay` is also set. */
  sticky?: boolean;
  /**
   * Float the navbar over the next sibling (e.g. a hero section) using
   * absolute positioning. Unlike `sticky`, it doesn't reserve layout space
   * and scrolls away with the page. Takes precedence over `sticky` when
   * both are provided.
   */
  overlay?: boolean;
  /**
   * Translucent dark background with backdrop-blur. Composes with `overlay`
   * for a glass hero-overlay look, and with `bgDark` for white text.
   */
  glass?: boolean;
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
  overlay = false,
  glass = false,
  className,
  // eslint-disable-next-line deprecation/deprecation -- backward-compat bridge
  title,
  // eslint-disable-next-line deprecation/deprecation -- backward-compat bridge
  titleHref = '/',
  // eslint-disable-next-line deprecation/deprecation -- backward-compat bridge
  LinkComponent,
}: Readonly<NavbarProps>) => {
  const textColor = bgDark ? 'text-light' : 'text-dark dark:text-light';
  // overlay takes precedence over sticky when both are passed.
  const positionClass = overlay
    ? 'absolute top-0 left-0 right-0 z-50'
    : sticky
      ? 'sticky top-0 z-50'
      : '';
  const glassClass = glass ? 'bg-black/20 dark:bg-white/10  backdrop-blur-md' : '';
  // CSS custom property so Brand/Content get the resolved color without
  // React context (which would require 'use client').
  const navbarColorVar = bgDark
    ? '[--navbar-color:white]'
    : '[--navbar-color:var(--text-dark,#1a1a1a)] dark:[--navbar-color:var(--text-light,white)]';

  const hasLegacyTitle = typeof title === 'string' && title !== '';
  const LinkTag = LinkComponent ?? ('a' as React.ElementType);

  return (
    <nav className={cn(bgColor, positionClass, glassClass, textColor, navbarColorVar, 'm-0 p-0', className)}>
      <div
        className={cn(
          'container flex flex-wrap items-center mx-auto gap-3 py-2 px-3',
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
