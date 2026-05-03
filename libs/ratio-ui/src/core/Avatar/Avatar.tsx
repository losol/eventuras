import type { FC } from 'react';
import { cn } from '../../utils/cn';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  /**
   * User image URL. Rendered as an `<img>` over the initials. When the
   * URL loads, the photo covers the initials. When it fails to load
   * the browser paints its default broken-image indicator inside the
   * `<img>` box, which obscures the initials underneath — pass URLs
   * you've already verified, or skip `src` and rely on the initials.
   */
  src?: string;
  /**
   * User's name. Used for the `<img>` alt attribute, the wrapper's
   * accessible name when `src` is set, and (when `initials` is
   * omitted) auto-derived initials — first letter of the first and
   * last word, lowercased; for a single-word name the first two
   * letters of that word.
   */
  name?: string;
  /**
   * Initials to display under the image. Defaults to the first letter
   * of the first and last word in `name` (or the first two letters
   * for a single-word name). Override when the auto-derivation isn't
   * quite right (e.g. "Leo van der Losen" → `ll` by default; pass
   * `'lv'` to keep "van" in there).
   */
  initials?: string;
  /**
   * Visual size — `sm` (30px), `md` (40px), `lg` (44px). Matches the
   * design reference's trigger / default / identity-header sizes.
   */
  size?: AvatarSize;
  /**
   * Override the wrapper's accessible label. Defaults to `name` when
   * `src` is set, otherwise the avatar relies on the visible initials
   * and is left unlabelled. Use this to provide a meaningful label
   * when neither `name` nor visible content carries one.
   */
  ariaLabel?: string;
  className?: string;
  testId?: string;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'size-[30px] text-[13px]',
  md: 'size-10 text-sm',
  lg: 'size-11 text-lg',
};

function deriveInitials(name?: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '';
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toLowerCase();
  }
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toLowerCase();
}

/**
 * User avatar — circular badge with serif italic initials over a
 * primary-tinted radial gradient. Pass `src` to render a profile
 * image; the browser handles loading and missing-resource painting,
 * so callers should provide URLs they trust.
 *
 * Pair with the `Menu.Trigger` (avatar pill in a navbar) and the
 * identity header inside a user-menu dropdown — three sizes cover the
 * common cases.
 *
 * @example
 * ```tsx
 * <Avatar name="Leo Losen" />                  // initials "ll"
 * <Avatar name="Ola" initials="o" size="sm" /> // override + small
 * <Avatar name="Ola" src="/avatar.jpg" size="lg" /> // image + lg
 * ```
 */
export const Avatar: FC<AvatarProps> = ({
  src,
  name,
  initials,
  size = 'md',
  ariaLabel,
  className,
  testId,
}) => {
  const initialsText = initials ?? deriveInitials(name);
  const wrapperLabel = ariaLabel ?? (src ? name : undefined);
  // Only set role="img" when we also have an accessible label. A
  // role="img" without a name fails axe rules, and the avatar with
  // visible initials and no src is already labelled by its text.
  const a11yProps = wrapperLabel
    ? { role: 'img' as const, 'aria-label': wrapperLabel }
    : {};

  return (
    <span
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0',
        'text-primary-800 dark:text-primary-200 font-serif italic font-medium tracking-tight',
        'bg-[radial-gradient(circle_at_30%_30%,color-mix(in_oklch,var(--primary)_25%,var(--surface)),color-mix(in_oklch,var(--primary)_12%,var(--surface)))]',
        'dark:bg-[radial-gradient(circle_at_30%_30%,color-mix(in_oklch,var(--primary)_10%,var(--surface)),color-mix(in_oklch,var(--primary)_4%,var(--surface)))]',
        SIZE_CLASSES[size],
        className,
      )}
      {...a11yProps}
      data-testid={testId}
    >
      {initialsText && <span aria-hidden={Boolean(src)}>{initialsText}</span>}
      {src && (
        <img
          src={src}
          alt={name ?? ''}
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </span>
  );
};

Avatar.displayName = 'Avatar';
