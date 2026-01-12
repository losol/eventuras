import React from 'react';
import { BoxProps, buildSpacingClasses } from '../../layout/Box/Box';

export interface StoryFooterProps extends BoxProps {
  /**
   * Content of the story footer
   */
  children: React.ReactNode;
}

/**
 * StoryFooter component for displaying story metadata or related content
 *
 * @example
 * ```tsx
 * <StoryFooter>
 *   <Text className="text-sm">Published: January 1, 2024</Text>
 * </StoryFooter>
 * ```
 */
export function StoryFooter({
  children,
  className,
  padding,
  margin,
  border,
  width,
  height,
  gap = '2',
  backgroundColorClass,
  backgroundImageUrl,
  as: Component = 'footer',
  style,
  ...props
}: StoryFooterProps) {
  const spacingClasses = buildSpacingClasses({ padding, margin, border, width, height, gap });

  const footerClasses = [
    'story-footer',
    spacingClasses,
    backgroundColorClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const combinedStyle: React.CSSProperties = {
    ...style,
    ...(backgroundImageUrl ? { backgroundImage: `url(${backgroundImageUrl})` } : {}),
  };

  return (
    <Component className={footerClasses} style={combinedStyle} {...props}>
      {children}
    </Component>
  );
}
