import React from 'react';
import { cn } from '../../utils/cn';

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
 * ## Composition
 *
 * Chip is a flex row with `gap-1.5`, so any children render side-by-side.
 * Use `<Chip.Dot/>` for the conventional `currentColor` dot, or compose any
 * icon, text, or other element before/after the label.
 *
 * Typography (mono, uppercase, etc.) is intentionally not on Chip — apply
 * it via `className` or wrap the text in a typography primitive. This keeps
 * Chip focused on the chip shape itself.
 *
 * ```tsx
 * <Chip>v2.4</Chip>
 *
 * // Tag style — typography via className
 * <Chip className="font-mono uppercase tracking-widest font-bold px-2 py-0.5">
 *   prod
 * </Chip>
 *
 * // Leading dot
 * <Chip>
 *   <Chip.Dot />
 *   active
 * </Chip>
 *
 * // Themed scope — overrides cascade in
 * <section style={{ '--chip-bg': '#0a0d09', '--chip-fg': '#b8f2c8' }}>
 *   <Chip>prod</Chip>
 * </section>
 *
 * // Sharp corners
 * <div style={{ '--chip-radius': '0' }}>
 *   <Chip>v2.4</Chip>
 * </div>
 * ```
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export type ChipVariant = 'subtle' | 'outline' | 'filled';

export interface ChipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  children: React.ReactNode;
  /**
   * Visual treatment.
   * - `'subtle'` (default) — tinted background, border, muted text via chip tokens
   * - `'outline'` — transparent-ish background + border derived from `currentColor`
   * - `'filled'` — solid `currentColor` background
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
      'bg-(--chip-bg) text-(--chip-fg) border border-(--chip-border)',
      // Variant treatments — outline + filled tint from `currentColor`.
      // Outline uses --alpha-2 (10%) for the background wash — pulled from
      // the shared alpha scale rather than a magic number.
      variant === 'outline' && 'bg-current/(--alpha-2) border-current',
      variant === 'filled' && 'bg-current text-(--chip-on-solid) border-transparent',
      className,
    )}
  >
    {children}
  </span>
);
ChipRoot.displayName = 'Chip';

/**
 * Small leading/trailing dot in `currentColor`. Compose inside `<Chip>`
 * before or after the label.
 */
const Dot: React.FC<{ className?: string }> = ({ className }) => (
  <span
    aria-hidden="true"
    className={cn('size-2 rounded-full bg-current opacity-70 shrink-0', className)}
  />
);
Dot.displayName = 'Chip.Dot';

export const Chip = Object.assign(ChipRoot, { Dot });
