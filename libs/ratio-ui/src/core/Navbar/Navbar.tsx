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
  titleHref?: string;
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
  LinkComponent,
}: NavbarProps) => {
  const textColor = bgDark ? 'text-white' : 'text-black dark:text-white';
  const LinkTag = LinkComponent ?? ('a' as React.ElementType);

  return (
    <nav className={`${bgColor} z-10 ${textColor} m-0 p-0`}>
      <div className="container flex flex-wrap items-center justify-between mx-auto py-2 px-3">
        { title && (
        <LinkTag href={titleHref} className={`text-2xl tracking-tight whitespace-nowrap ${textColor}`}>
          {title}
          </LinkTag>
        )}
        {children}
      </div>
    </nav>
  );
};
