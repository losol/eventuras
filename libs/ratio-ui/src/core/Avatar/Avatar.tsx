import { useState, type FC } from 'react';
import { cn } from '../../utils/cn';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  /**
   * User image URL. Rendered as an `<img>` over the initials. If the
   * image fails to load, the component hides the `<img>` and falls
   * back to the initials underneath — no broken-image indicator is
   * shown.
   */
  src?: string;
  /**
   * User's name. Used for the wrapper's accessible label and (when
   * `initials` is omitted) auto-derived initials — first letter of
   * the first and last word, lowercased; for a single-word name the
   * first two letters of that word.
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
   * provided. Use this when neither `name` nor visible content carries
   * a meaningful label.
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
 * image; on load failure the component falls back to the initials
 * underneath without showing a broken-image indicator.
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
  const wrapperLabel = ariaLabel ?? name;
  // role="img" requires a name. When the avatar has no accessible
  // label and no visible text, leave the role off so axe doesn't flag
  // an unlabelled image role; the empty span is then ignored by AT.
  const a11yProps = wrapperLabel
    ? { role: 'img' as const, 'aria-label': wrapperLabel }
    : {};

  // Track the URL that failed instead of a boolean flag — comparing
  // against `src` lets a new URL re-show the image without an effect
  // resetting state on every src change.
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && brokenSrc !== src;

  return (
    <span
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0',
        'text-(--text) font-serif italic font-medium tracking-tight',
        'bg-[radial-gradient(circle_at_30%_30%,color-mix(in_oklch,var(--primary)_25%,var(--surface)),color-mix(in_oklch,var(--primary)_12%,var(--surface)))]',
        'dark:bg-[radial-gradient(circle_at_30%_30%,color-mix(in_oklch,var(--primary)_10%,var(--surface)),color-mix(in_oklch,var(--primary)_4%,var(--surface)))]',
        SIZE_CLASSES[size],
        className,
      )}
      {...a11yProps}
      data-testid={testId}
    >
      {initialsText && <span aria-hidden={showImage}>{initialsText}</span>}
      {showImage && (
        <img
          src={src}
          alt=""
          // Read the failed URL off the element rather than closing
          // over the `src` prop — if the prop has already advanced to
          // a newer value when the error fires, we'd otherwise mark
          // the new (still-valid) URL as broken.
          onError={(e) => setBrokenSrc(e.currentTarget.getAttribute('src'))}
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </span>
  );
};

Avatar.displayName = 'Avatar';
