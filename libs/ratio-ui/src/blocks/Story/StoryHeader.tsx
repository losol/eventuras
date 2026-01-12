import React from 'react';
import { BoxProps, buildSpacingClasses } from '../../layout/Box/Box';

export interface StoryHeaderProps extends BoxProps {
  /**
   * Content of the story header
   */
  children: React.ReactNode;
}

/**
 * StoryHeader component for displaying story heading and lead content
 *
 * @example
 * ```tsx
 * <StoryHeader>
 *   <Heading>Welcome to our blog</Heading>
 *   <Lead>This is the introduction</Lead>
 * </StoryHeader>
 * ```
 */
export function StoryHeader({
  children,
  className,
  padding = 'py-3',
  margin = 'mb-6',
  border,
  width,
  height,
  gap = '4',
  backgroundColorClass,
  backgroundImageUrl,
  as: Component = 'header',
  style,
  ...props
}: StoryHeaderProps) {
  const spacingClasses = buildSpacingClasses({ padding, margin, border, width, height, gap });

  const headerClasses = [
    'story-header',
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
    <Component className={headerClasses} style={combinedStyle} {...props}>
      {children}
    </Component>
  );
}
