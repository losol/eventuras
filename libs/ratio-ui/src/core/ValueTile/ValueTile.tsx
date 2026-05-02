import React, { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export type ValueTileOrientation = 'vertical' | 'horizontal';

export interface ValueTileProps {
  /**
   * Display value for the convenience API. When using the compound API,
   * leave this undefined and pass `ValueTile.Value` as a child instead.
   * `undefined` renders an em-dash, matching the prior `NumberCard`
   * loading state.
   */
  number?: number | string;
  /**
   * Caption for the convenience API. Pair with `number`. Use the
   * compound `ValueTile.Caption` for richer markup.
   */
  label?: string;
  /**
   * `vertical` (default) stacks value above caption — used by Hero stat
   * panels and dashboard tiles. `horizontal` lays them out side-by-side
   * with a baseline-aligned row, suited to inline data displays.
   */
  orientation?: ValueTileOrientation;
  children?: ReactNode;
  className?: string;
  testId?: string;
}

interface ValueProps {
  children?: ReactNode;
  className?: string;
}

interface CaptionProps {
  children?: ReactNode;
  className?: string;
}

interface ValueTileComponent extends React.FC<ValueTileProps> {
  Value: React.FC<ValueProps>;
  Caption: React.FC<CaptionProps>;
}

// Orientation propagates from root to Caption via a `data-orientation`
// attribute on the root element + Tailwind's named group-data variant.
// CSS-only so ValueTile stays server-component-safe (no React context).

/**
 * Editorial stat tile — a serif display value with a small muted caption.
 *
 * Two APIs:
 * - **Convenience:** pass `number` + `label` for the dashboard pattern
 *   (matches the prior `NumberCard` shape, with the brand's editorial
 *   look).
 * - **Compound:** wrap `ValueTile.Value` and `ValueTile.Caption` for rich
 *   markup — italic accents, multi-token phrases, etc.
 *
 * Has no surface of its own. Wrap in `Card` (e.g.
 * `<Card transparent border>` or `<Card padding="lg" radius="lg"
 * shadow="none">` for the editorial tile look) when you want a
 * border or background.
 *
 * @example
 * ```tsx
 * <ValueTile number={42} label="Total events" />
 *
 * <ValueTile>
 *   <ValueTile.Value>
 *     <em className="text-(--accent)">240+</em> articles
 *   </ValueTile.Value>
 *   <ValueTile.Caption>Across reading, writing, research, and craft</ValueTile.Caption>
 * </ValueTile>
 * ```
 */
const ValueTileRoot: ValueTileComponent = (({
  number,
  label,
  orientation = 'vertical',
  children,
  className,
  testId,
}: ValueTileProps) => {
  const layoutClass =
    orientation === 'horizontal' ? 'flex items-baseline gap-3' : 'flex flex-col';

  const useConvenienceApi = number !== undefined || label !== undefined;
  const inner = useConvenienceApi ? (
    <>
      <ValueTileValue>{number ?? '—'}</ValueTileValue>
      {label && <ValueTileCaption>{label}</ValueTileCaption>}
    </>
  ) : (
    children
  );

  return (
    <div
      className={cn('group/value-tile', layoutClass, className)}
      data-orientation={orientation}
      data-testid={testId}
    >
      {inner}
    </div>
  );
}) as ValueTileComponent;

/**
 * Display value slot. Serif, large, follows the semantic `--primary`
 * token (Linseed-600 on light, Linseed-400 on dark) so the value reads
 * on either surface. Wrap accent tokens in `<em>` for the editorial
 * italic-numeral look (HTML `<em>` is italic by default; add a color
 * class for emphasis).
 */
const ValueTileValue: React.FC<ValueProps> = ({ children, className }) => (
  <div
    className={cn(
      'font-serif text-4xl leading-none tracking-tight text-(--primary)',
      className,
    )}
  >
    {children}
  </div>
);

/**
 * Caption slot. Small muted line under the value (vertical) or beside it
 * (horizontal). The vertical layout adds a small top margin; horizontal
 * relies on the parent's gap.
 */
const ValueTileCaption: React.FC<CaptionProps> = ({ children, className }) => (
  <p
    className={cn(
      'text-sm text-(--text-muted)',
      // Vertical (default) gets a small top margin; horizontal cancels it
      // so the caption sits flush on the same baseline.
      'mt-1.5 group-data-[orientation=horizontal]/value-tile:mt-0',
      className,
    )}
  >
    {children}
  </p>
);

ValueTileRoot.Value = ValueTileValue;
ValueTileRoot.Caption = ValueTileCaption;

ValueTileRoot.displayName = 'ValueTile';

export const ValueTile = ValueTileRoot;
