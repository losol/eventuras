import { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface NavbarProps {
  children?: ReactNode;
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
   * for a glass hero-overlay look. Pair with `surface-dark` className when
   * the resulting background is dark enough that you need light text.
   */
  glass?: boolean;
  className?: string;
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
    <div className={cn('flex shrink-0 items-center text-(--text)', className)}>
      {children}
    </div>
  );
}

function NavbarContent({ children, className }: Readonly<NavbarContentProps>) {
  return (
    <div className={cn('flex grow items-center gap-3 text-(--text)', className)}>
      {children}
    </div>
  );
}

const NavbarRoot = ({
  children,
  bgColor,
  sticky = false,
  overlay = false,
  glass = false,
  className,
}: Readonly<NavbarProps>) => {
  // overlay takes precedence over sticky when both are passed.
  const positionClass = overlay
    ? 'absolute top-0 left-0 right-0 z-50'
    : sticky
      ? 'sticky top-0 z-50'
      : '';
  const glassClass = glass ? 'bg-black/20 dark:bg-white/10  backdrop-blur-md' : '';

  return (
    <nav className={cn(bgColor, positionClass, glassClass, 'text-(--text) m-0 p-0', className)}>
      <div className="container flex flex-wrap items-center mx-auto gap-3 py-2 px-3">
        {children}
      </div>
    </nav>
  );
};

export const Navbar = Object.assign(NavbarRoot, {
  Brand: NavbarBrand,
  Content: NavbarContent,
});
