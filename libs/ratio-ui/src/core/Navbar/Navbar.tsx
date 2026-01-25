import React from 'react';

export interface NavbarProps {
  /** Text shown at the left side. */
  title?: string;
  /** Optional right‑side content (buttons, links …). */
  children?: React.ReactNode;
  /** Forces white text for dark backgrounds. */
  bgDark?: boolean;
  /** Extra Tailwind background class (default `bg-transparent`). */
  bgColor?: string;
  /** URL for the title link (default `/`). */
  titleHref?: string;  /** Make navbar sticky at the top (default: false). */
  sticky?: boolean;
  /** Routing link component (e.g. `next/link`, `react-router-dom` Link). */
  LinkComponent?: React.ComponentType<{
    href: string;
    children: React.ReactNode;
    className?: string;
  }>;
}

/**
 * Simple, responsive navbar.
 *
 * @see {@link NavbarProps}
 *
 */
export const Navbar = ({
  title,
  children,
  bgDark = false,
  bgColor = 'bg-transparent',
  titleHref = '/',
  sticky = false,
  LinkComponent,
}: NavbarProps) => {
  const textColor = bgDark ? 'text-white' : 'text-black dark:text-white';
  const LinkTag = LinkComponent ?? ('a' as React.ElementType);
  const positionClass = sticky ? 'sticky top-0 z-50' : '';

  return (
    <nav className={`${bgColor} ${positionClass} ${textColor} m-0 p-0`}>
      <div className="flex flex-wrap items-center justify-between mx-auto py-2 px-3">
        { title && (
        <LinkTag href={titleHref} className={`text-lg tracking-tight whitespace-nowrap no-underline ${textColor}`}>
          {title}
          </LinkTag>
        )}
        {children}
      </div>
    </nav>
  );
};
