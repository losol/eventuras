import React from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses } from '../../tokens/spacing';

export interface LeadProps extends SpacingProps {
  text?: string | null;
  children?: React.ReactNode;
  as?: 'p' | 'div';
  className?: string;
  testId?: string;
}

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
  text,
  children,
  as: Component = 'p',
  className = '',
  padding, paddingX, paddingY, paddingTop, paddingBottom,
  margin, marginX, marginY, marginTop, marginBottom,
  gap,
  testId,
  ...restHtmlProps
}) => {
  // Only one of text/children
  if (text != null && children != null) {
    throw new Error(
      'Lead component cannot take both `text` and `children`. Please provide only one.',
    );
  }

  // Nothing to render?
  if (text == null && children == null) {
    return null;
  }

  const content = text != null ? text : children;

  // Compute spacing
  const spacingCls = buildSpacingClasses({ padding, paddingX, paddingY, paddingTop, paddingBottom, margin, marginX, marginY, marginTop, marginBottom, gap });

  // Default lead styling - larger text, medium weight
  const leadClasses = ['text-lg font-medium leading-relaxed', spacingCls, className]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={leadClasses} data-testid={testId} {...restHtmlProps}>
      {content}
    </Component>
  );
};
