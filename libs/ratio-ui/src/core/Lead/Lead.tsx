import React from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses } from '../../tokens/spacing';

interface LeadBaseProps extends SpacingProps {
  as?: 'p' | 'div';
  className?: string;
  testId?: string;
}

export type LeadProps = LeadBaseProps &
  ({ children: React.ReactNode; text?: never } | { text: string | null; children?: never });

/**
 * Lead component for displaying introduction or lead text
 *
 * Typically used as the first paragraph after a heading to introduce the content.
 * Renders with larger text size and medium font weight.
 *
 * @example
 * ```tsx
 * <Lead>This is an introduction to the article...</Lead>
 * ```
 */
export const Lead: React.FC<LeadProps> = ({
  children,
  text,
  as: Component = 'p',
  className = '',
  padding, paddingX, paddingY, paddingTop, paddingBottom,
  margin, marginX, marginY, marginTop, marginBottom,
  gap,
  testId,
}: LeadProps) => {
  const renderable = text ?? children;
  if (renderable == null) return null;

  const spacingCls = buildSpacingClasses({ padding, paddingX, paddingY, paddingTop, paddingBottom, margin, marginX, marginY, marginTop, marginBottom, gap });

  const leadClasses = ['text-lg font-medium leading-relaxed', spacingCls, className]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={leadClasses} data-testid={testId}>
      {renderable}
    </Component>
  );
};
