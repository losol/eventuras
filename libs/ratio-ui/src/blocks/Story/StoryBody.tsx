import React from 'react';
import { BoxProps, buildSpacingClasses } from '../../layout/Box/Box';

export interface StoryBodyProps extends BoxProps {
  /**
   * Content of the story body
   */
  children: React.ReactNode;
}

/**
 * StoryBody component for displaying main story content
 *
 * @example
 * ```tsx
 * <StoryBody>
 *   <Text>Main content goes here...</Text>
 * </StoryBody>
 * ```
 */
export function StoryBody({
  children,
  className,
  padding,
  margin,
  border,
  width,
  height,
  gap = '4',
  backgroundColorClass,
  backgroundImageUrl,
  as: Component = 'section',
  style,
  ...props
}: StoryBodyProps) {
  const spacingClasses = buildSpacingClasses({ padding, margin, border, width, height, gap });

  const bodyClasses = [
    'story-body',
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
    <Component className={bodyClasses} style={combinedStyle} {...props}>
      {children}
    </Component>
  );
}
