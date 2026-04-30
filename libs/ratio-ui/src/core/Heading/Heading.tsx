import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses } from '../../tokens/spacing';
import { cn } from '../../utils/cn';

export interface HeadingProps extends SpacingProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
  className?: string;
  testId?: string;
}

/**
 * Semantic heading component.
 *
 * Text color follows `--text` from the design tokens, which is theme-aware
 * by default. To force a tone for content rendered on a colored container,
 * wrap with `<div className="surface-dark">` (or `surface-light`) — see
 * `Surface tone overrides` in `global.css`.
 */
const HeadingRoot = ({
  as: HeadingComponent = 'h1',
  children,
  className,
  testId,
  ...spacingProps
}: HeadingProps) => (
  <HeadingComponent
    className={cn('text-(--text)', buildSpacingClasses(spacingProps), className)}
    data-testid={testId}
  >
    {children}
  </HeadingComponent>
);

export interface HeadingGroupProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Renders an `<hgroup>` — semantic HTML for a heading paired with an
 * eyebrow, kicker, or tagline. Screen readers announce the group as a
 * single heading unit, so use this when stacking `Heading.Eyebrow` +
 * `Heading` (or any title + subtitle pair).
 *
 * @example
 * ```tsx
 * <Heading.Group>
 *   <Heading.Eyebrow>The library</Heading.Eyebrow>
 *   <Heading as="h2">What's inside</Heading>
 * </Heading.Group>
 * ```
 */
const HeadingGroup = ({ children, className }: HeadingGroupProps) => (
  <hgroup className={className}>{children}</hgroup>
);

export interface HeadingEyebrowProps {
  children: React.ReactNode;
  className?: string;
  /**
   * `primary` (default) uses Linseed primary — the quieter kicker for
   * subordinate sections. `accent` uses Ochre accent — louder, reserved
   * for the page's top heading (heroes, landing).
   */
  tone?: 'primary' | 'accent';
}

const eyebrowToneClasses: Record<NonNullable<HeadingEyebrowProps['tone']>, string> = {
  primary: 'text-(--primary)',
  accent: 'text-(--accent)',
};

/**
 * Small mono-font kicker line for above a heading. Pair with `Heading`
 * inside `Heading.Group` so screen readers announce it as the heading's
 * subtitle.
 */
const HeadingEyebrow = ({ children, className, tone = 'primary' }: HeadingEyebrowProps) => (
  <p
    className={cn(
      'font-mono text-[10.5px] uppercase tracking-[0.18em] font-bold mb-2',
      eyebrowToneClasses[tone],
      className,
    )}
  >
    {children}
  </p>
);

export const Heading = Object.assign(HeadingRoot, {
  Group: HeadingGroup,
  Eyebrow: HeadingEyebrow,
});
