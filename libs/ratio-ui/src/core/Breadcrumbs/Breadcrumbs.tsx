'use client';

import React, { createContext, useContext } from 'react';
import {
  Breadcrumbs as AriaBreadcrumbs,
  Breadcrumb as AriaBreadcrumb,
  type BreadcrumbProps as AriaBreadcrumbProps,
} from 'react-aria-components';

type LinkComponent = React.ComponentType<{
  href: string;
  children: React.ReactNode;
  className?: string;
}>;

const LinkContext = createContext<LinkComponent | undefined>(undefined);

export interface BreadcrumbsProps {
  /** Custom className for the breadcrumbs container */
  className?: string;
  /** Custom Link component (e.g., Next.js Link) */
  LinkComponent?: LinkComponent;
  children: React.ReactNode;
}

export interface BreadcrumbProps extends Omit<AriaBreadcrumbProps, 'className'> {
  /** Navigation href */
  href?: string;
  /** Custom className for the breadcrumb */
  className?: string;
  children: React.ReactNode;
}

/**
 * Breadcrumbs component for navigation hierarchy
 *
 * @example
 * ```tsx
 * import { Link } from '@eventuras/ratio-ui-next';
 *
 * <Breadcrumbs LinkComponent={Link}>
 *   <Breadcrumb href="/">Home</Breadcrumb>
 *   <Breadcrumb href="/docs">Docs</Breadcrumb>
 *   <Breadcrumb>Current Page</Breadcrumb>
 * </Breadcrumbs>
 * ```
 */
export function Breadcrumbs({ className = '', LinkComponent, children, ...props }: Readonly<BreadcrumbsProps>) {
  return (
    <LinkContext.Provider value={LinkComponent}>
      <AriaBreadcrumbs
        className={`flex items-center text-sm gap-2 ${className}`}
        {...props}
      >
        {children}
      </AriaBreadcrumbs>
    </LinkContext.Provider>
  );
}

/**
 * Individual breadcrumb item
 */
export function Breadcrumb({ href, className = '', children, ...props }: Readonly<BreadcrumbProps>) {
  const LinkComponent = useContext(LinkContext);

  const linkClasses = `text-primary-600 dark:text-primary-400 hover:underline ${className}`;

  let content: React.ReactNode;
  if (href && LinkComponent) {
    content = (
      <LinkComponent href={href} className={linkClasses}>
        {children}
      </LinkComponent>
    );
  } else if (href) {
    content = (
      <a href={href} className={linkClasses}>
        {children}
      </a>
    );
  } else {
    content = (
      <span className={`text-gray-700 dark:text-gray-300 ${className}`}>
        {children}
      </span>
    );
  }

  return (
    <>
      <AriaBreadcrumb {...props}>
        {content}
      </AriaBreadcrumb>
      <span className="text-gray-400 dark:text-gray-600 last:hidden" aria-hidden="true">
        /
      </span>
    </>
  );
}
