import React, { createContext, ReactNode, useContext } from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import type { BorderProps } from '../../tokens/borders';
import type { Color } from '../../tokens/colors';
import { surfaceBgClasses } from '../../tokens/colors';
import { buildBorderClasses } from '../../tokens/borders';
import { buildSpacingClasses } from '../../tokens/spacing';
import { cn } from '../../utils/cn';

// Internal context so slots (Lead/Body/Trail) can mirror the parent's
// `border` prop on their own dashed separator borders. When the outer
// strip is borderless, the dashed slot dividers disappear too — keeps
// the border API consistent across the whole component.
const StripContext = createContext<{ showSeparators: boolean }>({ showSeparators: true });

export type StripShadow = 'none' | 'xs' | 'sm' | 'md';

export interface StripProps extends BorderProps, Pick<SpacingProps, 'margin' | 'marginX' | 'marginY' | 'marginTop' | 'marginBottom'> {
  children?: ReactNode;
  as?: React.ElementType;
  href?: string;
  className?: string;
  /**
   * Semantic surface tint. Maps to `bg-{color}-50` in light and
   * `bg-{color}-950` in dark via `surfaceBgClasses`. Overrides the
   * default `--card` fill.
   */
  color?: Color;
  /**
   * Drop shadow. Defaults to `'none'` — strips read as flat list rows
   * by default. Bump to `'xs'` if you want them slightly lifted.
   */
  shadow?: StripShadow;
  /**
   * Add the canonical interactive hover — surface lifts 1px, border
   * picks up `--primary`, and a soft Linseed-tinted glow appears. Use
   * only when the strip is itself a link / clickable surface.
   */
  hoverEffect?: boolean;
  testId?: string;
}

const SHADOW_CLASSES: Record<StripShadow, string> = {
  none: '',
  xs: 'shadow-xs',
  sm: 'shadow-sm',
  md: 'shadow-md',
};

export interface StripSlotProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Leading slot of a `Strip` — a fixed-width column anchored on the
 * left. Use for date stamps, avatars, icons, or other identity blocks.
 * Picks up a subtle tinted background and a dashed right-border that
 * separates it from the body.
 */
const StripLead = ({ children, className }: StripSlotProps) => {
  const { showSeparators } = useContext(StripContext);
  return (
    <div
      className={cn(
        'px-5 py-5 flex flex-col gap-1',
        showSeparators && 'border-b md:border-b-0 md:border-r border-dashed border-border-2',
        'bg-secondary-300 dark:bg-primary-900',
        // Default child typography — bare <span>s render as mono-uppercase
        // primary-toned date labels. Consumer overrides by passing different
        // element types (e.g. <div>) or adding their own classNames on the spans.
        '[&>span]:font-mono [&>span]:text-base [&>span]:uppercase [&>span]:tracking-wide [&>span]:font-bold [&>span]:text-(--primary) [&>span]:leading-tight',
        className,
      )}
    >
      {children}
    </div>
  );
};
StripLead.displayName = 'Strip.Lead';

/**
 * Body slot of a `Strip` — the flexible center column that takes
 * the remaining horizontal space. Use for the primary content (title,
 * description, pills).
 */
const StripBody = ({ children, className }: StripSlotProps) => (
  <div className={cn('px-6 py-5 flex flex-col gap-2 min-w-0', className)}>{children}</div>
);
StripBody.displayName = 'Strip.Body';

/**
 * Trailing slot of a `Strip` — the right-aligned column. Use for
 * meta info (location, points, duration) and a CTA. Stacks vertically
 * on wide screens, falls back to an inline row when the strip stacks.
 */
const StripTrail = ({ children, className }: StripSlotProps) => {
  const { showSeparators } = useContext(StripContext);
  return (
    <div
      className={cn(
        'px-6 py-5 flex flex-row md:flex-col items-start md:items-stretch md:justify-center gap-3 md:gap-2.5 min-w-0',
        showSeparators && 'border-t md:border-t-0 md:border-l border-dashed border-border-2',
        className,
      )}
    >
      {children}
    </div>
  );
};
StripTrail.displayName = 'Strip.Trail';

/**
 * Three-column horizontal card — leading slot (fixed-width left
 * column), body (flexible center), trailing slot (fixed-width right
 * column). Stacks vertically below the `md` breakpoint. Pair with
 * `Strip.Lead`, `Strip.Body`, `Strip.Trail` for the
 * canonical layout; pass `href` to render the strip itself as an
 * anchor (the whole row becomes clickable).
 *
 * Use for chronological listings, calendar entries, search results,
 * and any dense row-shaped content where date/identity, body, and
 * meta/action separate naturally.
 *
 * @beta This component is experimental. The prop shape, slot contract,
 * and visual treatment may change before release.
 *
 * @example
 * ```tsx
 * <Strip hoverEffect href="/events/123">
 *   <Strip.Lead>
 *     <span className="font-mono text-xs uppercase">SEP</span>
 *     <span className="font-serif text-5xl">14</span>
 *   </Strip.Lead>
 *   <Strip.Body>
 *     <h3 className="font-serif text-xl">Title</h3>
 *     <p className="text-sm text-(--text-muted)">Headline.</p>
 *   </Strip.Body>
 *   <Strip.Trail>
 *     <span>Place</span>
 *     <span>See course →</span>
 *   </Strip.Trail>
 * </Strip>
 * ```
 */
const StripRoot: React.FC<StripProps> = ({
  as,
  href,
  hoverEffect = false,
  shadow = 'none',
  color,
  children,
  className,
  testId,
  margin, marginX, marginY, marginTop, marginBottom,
  ...border
}) => {
  const Component: React.ElementType = as ?? (href ? 'a' : 'div');
  const radius = border.radius ?? 'xl';
  const borderProp = border.border ?? true;

  const bgClasses = color ? surfaceBgClasses[color] : 'bg-card';

  const transitionClasses = hoverEffect ? 'transition-all duration-200 ease-out' : '';
  const hoverShadow = shadow === 'none' ? 'hover:shadow-card-hover-tile' : 'hover:shadow-card-hover';
  const hoverClasses = hoverEffect
    ? cn('hover:border-(--primary) hover:-translate-y-px', hoverShadow)
    : '';

  const borderClasses = buildBorderClasses({
    border: borderProp,
    borderColor: border.borderColor,
    radius,
  });

  const spacingClasses = buildSpacingClasses({
    margin, marginX, marginY, marginTop, marginBottom,
  });

  // Internal slot separators echo the outer border on/off state. When
  // the consumer opts into a borderless strip, the dashed dividers
  // disappear too.
  const showSeparators = borderProp !== false && borderProp !== 'none';

  return (
    <StripContext.Provider value={{ showSeparators }}>
      <Component
        href={href}
        className={cn(
          'grid grid-cols-1 md:grid-cols-[160px_1fr_280px] gap-0 overflow-hidden',
          'text-(--text) no-underline',
          bgClasses,
          borderClasses,
          SHADOW_CLASSES[shadow],
          transitionClasses,
          hoverClasses,
          spacingClasses,
          className,
        )}
        data-testid={testId}
      >
        {children}
      </Component>
    </StripContext.Provider>
  );
};
StripRoot.displayName = 'Strip';

export const Strip = Object.assign(StripRoot, {
  Lead: StripLead,
  Body: StripBody,
  Trail: StripTrail,
});
