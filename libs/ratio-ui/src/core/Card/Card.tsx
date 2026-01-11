import React, { ReactNode } from 'react';
import { Box, BoxProps, getBackgroundStyle } from '../../layout/Box/Box';
import Container from '../../layout/Container/Container';
import { getGridClasses } from '../../tokens';

// Card-specific props that should not be passed to Box
interface CardSpecificProps {
  dark?: boolean;
  container?: boolean;
  variant?: 'default' | 'wide' | 'outline' | 'transparent';
  hoverEffect?: boolean;
  grid?: boolean;
}

export interface CardProps extends BoxProps, CardSpecificProps {
  children?: ReactNode;
}

/**
 * Card - Flexible card component with support for variants, grid layout, and composition
 *
 * @example
 * ```tsx
 * // Simple card
 * <Card>
 *   <Box>
 *     <Heading>Title</Heading>
 *     <Text>Description</Text>
 *   </Box>
 * </Card>
 *
 * // Card with grid layout and image
 * import NextImage from 'next/image';
 *
 * <Card variant="outline" grid>
 *   <Image src="/image.jpg" alt="Product" renderer={NextImage} />
 *   <Box>
 *     <Heading>Product Title</Heading>
 *     <Text>Product description</Text>
 *   </Box>
 * </Card>
 *
 * // Custom grid gap
 * <Card grid gap="8">
 *   <Image src="/image.jpg" alt="Hero" />
 *   <Box padding="p-6">
 *     <Heading>Hero Title</Heading>
 *   </Box>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
  dark = false,
  container = false,
  variant = 'default',
  hoverEffect = false,
  grid = false,
  gap = '6',
  children,
  // and these from BoxProps
  padding, margin, backgroundColorClass, backgroundImageUrl, className, style, ...rest
},) => {

  const baseClasses = "p-4 relative rounded-lg";
  const transitionClasses = hoverEffect ? "transform transition duration-300 ease-in-out" : "";

  const variantStyles = {
    default: hoverEffect
      ? 'bg-white dark:bg-slate-900 hover:bg-primary-200 dark:hover:bg-primary-900'
      : 'bg-white dark:bg-slate-900',
    wide: hoverEffect
      ? 'bg-white dark:bg-slate-900 hover:bg-primary-200 dark:hover:bg-primary-900 mx-auto min-h-[33vh]'
      : 'bg-white dark:bg-slate-900 mx-auto min-h-[33vh]',
    outline: 'border border-gray-200 dark:border-gray-700 bg-transparent',
    transparent: 'bg-transparent',
  };

  const backgroundColorClasses = backgroundColorClass ?? variantStyles[variant];

  const textColorClasses = dark
    ? 'text-white'
    : 'text-slate-900 dark:text-gray-100';

  const gridClasses = grid ? getGridClasses(gap as '4' | '6' | '8') : '';

  const cardClasses = [baseClasses, transitionClasses, backgroundColorClasses, textColorClasses, gridClasses, className];

  const combinedStyle = getBackgroundStyle(backgroundImageUrl) || style;

  // Extract only BoxProps to pass to Box component
  const boxProps: BoxProps = {
    as: rest.as,
    padding,
    margin,
    backgroundColorClass,
    backgroundImageUrl,
    className: cardClasses.join(' '),
    style: combinedStyle,
  };

  return (
    <Box {...boxProps}>
      {container ? <Container>{children}</Container> : children}
    </Box>
  );
};
