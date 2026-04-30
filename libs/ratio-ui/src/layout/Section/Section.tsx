import React, { type ReactNode } from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import type { Color } from '../../tokens/colors';
import { surfaceBgClasses } from '../../tokens/colors';
import { buildSpacingClasses, extractSpacingProps } from '../../tokens/spacing';
import { ArrowUpRight } from '../../icons';
import { cn } from '../../utils/cn';

export interface SectionProps
  extends SpacingProps,
    Omit<React.ComponentPropsWithoutRef<'section'>, keyof SpacingProps | 'color'> {
  color?: Color;
  /**
   * Marks the section as a dark surface so descendants (Heading, Button,
   * Link) pick up light `var(--text)` color. Use for hero sections with
   * dark or strongly colored backgrounds. For the rare case of forcing a
   * light surface inside a dark page, apply `className="surface-light"`.
   */
  dark?: boolean;
  testId?: string;
}

interface SectionHeaderProps {
  children?: ReactNode;
  className?: string;
}

interface SectionEyebrowProps {
  children?: ReactNode;
  className?: string;
}

interface SectionTitleProps {
  children?: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
}

interface SectionLinkProps extends React.ComponentPropsWithoutRef<'a'> {
  children?: ReactNode;
  className?: string;
}

interface SectionComponent extends React.FC<SectionProps> {
  Header: React.FC<SectionHeaderProps>;
  Eyebrow: React.FC<SectionEyebrowProps>;
  Title: React.FC<SectionTitleProps>;
  Link: React.FC<SectionLinkProps>;
}

const SectionRoot: SectionComponent = (props => {
  const [spacing, {
    color,
    dark,
    className,
    children,
    testId,
    ...rest
  }] = extractSpacingProps(props);

  return (
    <section
      className={cn(
        buildSpacingClasses(spacing),
        color && surfaceBgClasses[color],
        dark && 'surface-dark',
        className,
      )}
      data-testid={testId}
      {...rest}
    >
      {children}
    </section>
  );
}) as SectionComponent;

/**
 * Header row for a section — eyebrow + title on the left, optional
 * `Section.Link`(s) on the right. The component picks up `Section.Link`
 * children automatically and groups them on the right via
 * `justify-between`; everything else (eyebrow, title, free markup) is
 * stacked on the left in a flex column. Drop the link to get a
 * left-aligned single-column header.
 *
 * `Section.Link` must be a direct child — links nested inside fragments
 * or other wrappers are treated as part of the left column.
 *
 * @example
 * ```tsx
 * <Section.Header>
 *   <Section.Eyebrow>Aktuelle samlinger</Section.Eyebrow>
 *   <Section.Title>Det skjer i <em>Nordland</em></Section.Title>
 *   <Section.Link href="#">Se alle</Section.Link>
 * </Section.Header>
 * ```
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({ children, className }) => {
  const childArray = React.Children.toArray(children);
  const isLink = (child: React.ReactNode): boolean =>
    React.isValidElement(child) && child.type === SectionLink;
  const links = childArray.filter(isLink);
  const rest = childArray.filter(child => !isLink(child));

  return (
    <div
      className={cn('flex justify-between items-baseline gap-6 flex-wrap mb-9', className)}
    >
      <div className="flex flex-col">{rest}</div>
      {links.length > 0 && <div className="flex items-baseline gap-4">{links}</div>}
    </div>
  );
};

/**
 * Small mono-font kicker line above the section title. Uses Linseed
 * primary by default — quieter than a hero eyebrow (which is Ochre)
 * so sections stay subordinate to the page's primary heading.
 */
const SectionEyebrow: React.FC<SectionEyebrowProps> = ({ children, className }) => (
  <p
    className={cn(
      'font-mono text-[10.5px] uppercase tracking-[0.18em] text-(--primary) font-bold mb-2',
      className,
    )}
  >
    {children}
  </p>
);

/**
 * Section heading — serif, ~36px, with subtle italic accents for emphasis
 * via `<em>` children. Renders as `<h2>` by default since the page's
 * primary heading is usually in a Hero. Override via `as`.
 */
const SectionTitle: React.FC<SectionTitleProps> = ({ children, className, as: Component = 'h2' }) => (
  <Component
    className={cn(
      'font-serif font-medium text-3xl md:text-4xl leading-[1.1] tracking-tight m-0 text-(--text)',
      className,
    )}
  >
    {children}
  </Component>
);

/**
 * Right-side CTA link for `Section.Header`. Renders the label followed
 * by an up-right arrow that nudges on hover. Pass any anchor props
 * (`href`, `target`, etc.).
 */
const SectionLink: React.FC<SectionLinkProps> = ({ children, className, ...rest }) => (
  <a
    className={cn(
      'group inline-flex items-center gap-1.5 text-sm font-medium text-(--primary) no-underline border-b border-transparent hover:border-(--primary) pb-0.5 transition-colors',
      className,
    )}
    {...rest}
  >
    {children}
    <ArrowUpRight
      aria-hidden="true"
      focusable={false}
      className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
    />
  </a>
);

SectionRoot.Header = SectionHeader;
SectionRoot.Eyebrow = SectionEyebrow;
SectionRoot.Title = SectionTitle;
SectionRoot.Link = SectionLink;

SectionRoot.displayName = 'Section';

export const Section = SectionRoot;
