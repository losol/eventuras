import React, { ReactNode } from 'react';
import { Box, BoxProps, getBackgroundStyle } from '../../layout/Box/Box';
import Container from '../../layout/Container/Container';

export interface CardProps extends BoxProps {
  dark?: boolean;
  container?: boolean;
  variant?: 'default' | 'wide';
  hoverEffect?: boolean;
  children?: ReactNode;
}

export const Card: React.FC<CardProps> = ({
  dark = false,
  container = false,
  variant = 'default',
  hoverEffect = false,
  children,
  // and these from BoxProps
  padding, margin, backgroundColorClass, backgroundImageUrl, className, style, ...rest
},) => {

  const baseClasses = "p-4 relative rounded-md";
  const transitionClasses = hoverEffect ? "transform transition duration-300 ease-in-out" : "";
  const backgroundColorClasses = backgroundColorClass ??
    hoverEffect
    ? 'bg-white dark:bg-slate-900 hover:bg-primary-200 dark:hover:bg-primary-900'
    : 'bg-white dark:bg-slate-900';

  const textColorClasses = dark
    ? 'text-white'
    : 'text-slate-900 dark:text-gray-100';

  const variantClasses = variant === 'wide' ? 'mx-auto min-h-[33vh]' : '';

  const cardClasses = [baseClasses, transitionClasses, backgroundColorClasses, textColorClasses, variantClasses, className];

  const combinedStyle = getBackgroundStyle(backgroundImageUrl) || style;

  return (
    <Box
      as="div"
      padding={padding}
      margin={margin}
      backgroundColorClass={backgroundColorClass}
      backgroundImageUrl={backgroundImageUrl}
      className={cardClasses.join(' ')}
      style={combinedStyle}
      {...rest}
    >
      {container ? <Container>{children}</Container> : children}
    </Box>
  );
};
