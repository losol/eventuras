import React from 'react';
import { BoxProps, buildSpacingClasses } from '../../layout/Box/Box';

export interface StoryProps extends BoxProps {
  /**
   * Content of the story
   */
  children: React.ReactNode;
}

/**
 * Story component for displaying structured content
 *
 * A simple wrapper for composing story content with Heading, Lead, Text, and other components.
 *
 * @example
 * ```tsx
 * <Story>
 *   <Heading>Welcome to our blog</Heading>
 *   <Lead>This is the introduction</Lead>
 *   <Text>This is the main content...</Text>
 * </Story>
 * ```
 */
export function Story({
  children,
  className,
  padding,
  margin,
  border,
  width,
  height,
  gap,
  backgroundColorClass,
  backgroundImageUrl,
  as: Component = 'div',
  style,
  ...props
}: StoryProps) {
  const spacingClasses = buildSpacingClasses({ padding, margin, border, width, height, gap });

  const storyClasses = [
    'story',
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
    <Component className={storyClasses} style={combinedStyle} {...props}>
      {children}
    </Component>
  );
}
