import React from 'react';
import clsx from 'clsx';
import { ChevronDown } from '../../icons';
import { Stack } from '../../layout/Stack/Stack';

export interface AccordionProps {
  children: React.ReactNode;
}

export interface AccordionItemProps
  extends Omit<React.DetailsHTMLAttributes<HTMLDetailsElement>, 'name'> {
  children: React.ReactNode;
  /**
   * HTML `name` attribute for grouping. When multiple `<details>` share the
   * same name only one stays open at a time (exclusive accordion behavior).
   */
  name?: string;
}

export interface AccordionSummaryProps
  extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  hideChevron?: boolean;
}

export interface AccordionContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function Root({ children }: Readonly<AccordionProps>) {
  if (React.Children.count(children) <= 1) {
    return <>{children}</>;
  }
  return <Stack gap="sm">{children}</Stack>;
}

function Item({ children, className, ...rest }: Readonly<AccordionItemProps>) {
  return (
    <details
      className={clsx(
        'group rounded-md border border-border-1 bg-card',
        className,
      )}
      {...rest}
    >
      {children}
    </details>
  );
}

function Summary({
  children,
  className,
  hideChevron,
  ...rest
}: Readonly<AccordionSummaryProps>) {
  return (
    <summary
      className={clsx(
        'flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-3 font-medium',
        'hover:bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring)',
        '[&::-webkit-details-marker]:hidden',
        className,
      )}
      {...rest}
    >
      <span className="flex-1">{children}</span>
      {!hideChevron && (
        <ChevronDown
          className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        />
      )}
    </summary>
  );
}

function Content({
  children,
  className,
  ...rest
}: Readonly<AccordionContentProps>) {
  return (
    <div
      className={clsx(
        'p-3 text-sm',
        'transition-discrete transition-opacity duration-200 starting:opacity-0',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * Accordion — compound disclosure built on native `<details>`/`<summary>`.
 *
 * @beta API may change before 1.0.
 */
export const Accordion = Object.assign(Root, {
  Item,
  Summary,
  Content,
});
