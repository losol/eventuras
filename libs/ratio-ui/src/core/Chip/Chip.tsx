import React from 'react';
import { cn } from '../../utils/cn';
import './Chip.css';

/**
 * Theme-scope-aware tag primitive — a small chip whose colors and radius
 * come from CSS custom properties (`--chip-bg`, `--chip-fg`, `--chip-border`,
 * `--chip-radius`), so any ancestor can override the palette to match its
 * local theme.
 *
 * Named after the generic concept rather than a shape ("Chip" rather than
 * "Pill") because the radius is themeable: the default is pill-shaped
 * (9999px), but consumers can flip it to rounded or square locally
 * without changing the component.
 *
 * Pairs well with — but is intentionally simpler than — `Badge`:
 *
 * - **`Badge`** carries semantic status (info / success / warning / error),
 *   reads from app-level status tokens, and stays consistent across the page.
 * - **`Chip`** is a neutral tag primitive. It picks up whatever palette its
 *   ancestor scope provides — perfect for things like env tags inside a
 *   themed container, or kicker labels that should look "embedded" in their
 *   surrounding surface.
 *
 * ## Variants
 *
 * Both variants read from the same `--chip-*` tokens — the only difference
 * is whether the background is filled (`subtle`) or transparent (`outline`).
 * Override tokens on a wrapper to tint chips semantically:
 *
 * ```tsx
 * <div style={{
 *   '--chip-fg': 'var(--info-text)',
 *   '--chip-border': 'var(--info-border)',
 * } as React.CSSProperties}>
 *   <Chip variant="outline">info</Chip>
 * </div>
 * ```
 *
 * ## Composition
 *
 * Chip is a flex row with `gap-1.5`, so any children render side-by-side.
 * Use `<Chip.Dot/>` for the conventional `currentColor` dot, or compose any
 * icon, text, or other element before/after the label.
 *
 * Typography (mono, uppercase, etc.) is intentionally not on Chip — apply
 * it via `className` or wrap the text in a typography primitive.
 *
 * ```tsx
 * <Chip>v2.4</Chip>                              // default
 * <Chip variant="outline">draft</Chip>           // just a border
 * <Chip><Chip.Dot/> active</Chip>                // with leading dot
 *
 * // Themed scope — custom-property casts via React.CSSProperties so TS
 * // accepts the `--chip-*` keys (CSSProperties doesn't type custom props).
 * <section style={{ '--chip-bg': '#0a0d09' } as React.CSSProperties}>
 *   <Chip>prod</Chip>
 * </section>
 *
 * // Sharp corners
 * <div style={{ '--chip-radius': '0' } as React.CSSProperties}>
 *   <Chip>v2.4</Chip>
 * </div>
 * ```
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export type ChipVariant = 'subtle' | 'outline';

export interface ChipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  children: React.ReactNode;
  /**
   * Visual treatment.
   * - `'subtle'` (default) — `--chip-bg` background + border + text
   * - `'outline'` — transparent background, `--chip-border` outline + `--chip-fg` text
   */
  variant?: ChipVariant;
}

const ChipRoot: React.FC<ChipProps> = ({
  children,
  variant = 'subtle',
  className,
  ...rest
}) => (
  <span
    {...rest}
    className={cn(
      // Layout + typography baseline
      'inline-flex items-center gap-1.5 px-2.5 py-1 whitespace-nowrap',
      'text-xs font-medium leading-none',
      // Themable surface (overridable by any ancestor scope)
      'rounded-[var(--chip-radius,9999px)]',
      'text-(--chip-fg) border border-(--chip-border)',
      // Subtle has a filled background; outline is transparent
      variant === 'subtle' && 'bg-(--chip-bg)',
      variant === 'outline' && 'bg-transparent',
      className,
    )}
  >
    {children}
  </span>
);
ChipRoot.displayName = 'Chip';

interface DotProps {
  /**
   * When true, the dot animates an expanding-ring pulse in its current
   * color. Used by `LiveIndicator` for live-status pills, but available
   * to any chip composition (e.g. a recording indicator). Respects
   * `prefers-reduced-motion`.
   */
  pulse?: boolean;
  className?: string;
}

/**
 * Small leading/trailing dot in `currentColor`. Compose inside `<Chip>`
 * before or after the label. Opt-in to a pulsing animation via `pulse`.
 */
const Dot: React.FC<DotProps> = ({ pulse, className }) => (
  <span
    aria-hidden="true"
    className={cn(
      'size-2 rounded-full bg-current opacity-70 shrink-0',
      pulse && 'animate-[chip-dot-pulse_3s_ease-out_infinite] motion-reduce:animate-none',
      className,
    )}
  />
);
Dot.displayName = 'Chip.Dot';

export const Chip = Object.assign(ChipRoot, { Dot });
