import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

/**
 * A compact chrome button for toolbars, close affordances, table-row
 * actions, and other dense surfaces. Sibling to `Button` — use
 * `ActionButton` when a labelled `Button` would be too loud.
 *
 * Composes via `children` — works for icon-only, icon + text, or
 * text-only buttons:
 *
 * ```tsx
 * <ActionButton ariaLabel="Close" onClick={onClose}>
 *   <XIcon />
 * </ActionButton>
 *
 * <ActionButton onClick={onPause}>
 *   <PauseIcon />
 *   Pause
 * </ActionButton>
 *
 * <ActionButton onClick={onPublish} variant="solid">
 *   Publish
 * </ActionButton>
 * ```
 *
 * Colors and radius come from CSS tokens (`--action-button-bg`,
 * `--action-button-fg`, `--action-button-border`,
 * `--action-button-radius`, hover variants), so themed containers
 * (e.g. `Console`) can re-skin locally without forking.
 *
 * ## Accessibility
 *
 * If the button has no visible text (icon-only), pass `ariaLabel` so
 * screen readers can announce its purpose. The label is the only way
 * an icon-only button is identifiable — without it the button has no
 * accessible name and AT-users can't tell what it does. Linters and
 * AT will flag the omission; we don't enforce at the type level since
 * TypeScript can't inspect `children` for textual content.
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export type ActionButtonVariant = 'subtle' | 'solid';
export type ActionButtonSize = 'sm' | 'md' | 'lg';

export interface ActionButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /**
   * Required when there is no visible text inside (e.g. icon-only). Read by
   * screen readers as the button's accessible name. Optional when `children`
   * contains a text label.
   */
  ariaLabel?: string;
  /**
   * Visual treatment. Default (no variant) is a transparent, bordered chrome
   * button that hovers in — quiet enough for dense toolbars.
   *
   * - `'subtle'` — bg-card baseline, more chrome, for standalone actions
   * - `'solid'` — primary-tinted, for the one prominent action per toolbar
   */
  variant?: ActionButtonVariant;
  /** Frame height — sm (24) / md (28, default) / lg (36). Width auto-fits content. */
  size?: ActionButtonSize;
  className?: string;
  testId?: string;
}

const SIZE_CLASSES: Record<ActionButtonSize, string> = {
  sm: 'h-6 min-w-6 px-2.5',
  md: 'h-7 min-w-7 px-3',
  lg: 'h-9 min-w-9 px-4',
};

const SUBTLE_VARIANT =
  '[--action-button-bg:var(--card)] [--action-button-bg-hover:var(--card-hover)]';

const SOLID_VARIANT = [
  '[--action-button-bg:var(--primary)]',
  '[--action-button-fg:var(--text-on-primary)]',
  '[--action-button-border:transparent]',
  '[--action-button-bg-hover:color-mix(in_oklch,var(--primary)_92%,black)]',
  '[--action-button-fg-hover:var(--text-on-primary)]',
].join(' ');

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(function ActionButton(
  {
    ariaLabel,
    variant,
    size = 'md',
    children,
    className,
    type = 'button',
    testId,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={ariaLabel}
      className={cn(
        // Layout + typography
        'inline-flex items-center justify-center gap-1.5 shrink-0',
        'text-sm leading-none whitespace-nowrap cursor-pointer',
        // Themable surface (overridable by any ancestor scope)
        'rounded-[var(--action-button-radius,6px)]',
        'bg-(--action-button-bg) text-(--action-button-fg) border border-(--action-button-border)',
        // Interactions
        'transition-colors duration-150 ease-out',
        'enabled:hover:bg-(--action-button-bg-hover) enabled:hover:text-(--action-button-fg-hover)',
        'enabled:active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring)',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        // Sizes — height fixed; horizontal padding auto-strips when the
        // button only contains a single svg (icon-only stays square).
        SIZE_CLASSES[size],
        'has-[>svg:only-child]:px-0',
        // Variants (default = no class = transparent + bordered)
        variant === 'subtle' && SUBTLE_VARIANT,
        variant === 'solid' && SOLID_VARIANT,
        className,
      )}
      data-testid={testId}
      {...rest}
    >
      {children}
    </button>
  );
});
ActionButton.displayName = 'ActionButton';
