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
export const Heading = ({
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
