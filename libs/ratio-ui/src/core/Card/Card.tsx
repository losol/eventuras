// src/components/Card.tsx

import NextImage from 'next/image';
import React, { ReactNode } from 'react';
import { Box, BoxProps } from '../../layout/Box/Box';
import Container from '../../layout/Container/Container';
import HeadingComponent from '../Heading/Heading';
import TextComponent from '../Text/Text';

//
// Props for the Card itself.
// Extends BoxProps so you get padding/margin/bgColor/bgImage, etc.
// We add `dark`, `backgroundImage` (URL), `container` and optional `href`.
//
export interface CardProps extends BoxProps {
  dark?: boolean;
  container?: boolean;
  href?: string;
  children?: ReactNode;
}

const Card: React.FC<CardProps> & {
  Heading: typeof Heading;
  Text: typeof Text;
  Image: typeof Image;
} = ({
  dark = false,
  container = false,
  href,
  children,
  // and these from BoxProps
  padding, margin, backgroundColorClass, backgroundImageUrl, className, style, ...rest
},) => {
  //
  // Decide on background‐color + text‐color based on `dark`
  //
  const bgClass = dark
    ? 'bg-slate-900 text-gray-100'
    : 'bg-white text-gray-800 dark:text-gray-200';

  //
  // Build a Box style object for the gradient‐overlay + image
  //
  const combinedStyle = backgroundImageUrl
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.3)), url(${backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...style,
      }
    : style;

  //
  // Render an <a> if href provided, otherwise a <div>
  //
  const Wrapper = href ? 'a' : 'div';

  return (
    <Box
      as={Wrapper}
      padding={padding}
      margin={margin}
      backgroundColorClass={`${bgClass} ${backgroundColorClass || ''}`}
      backgroundImageUrl={backgroundImageUrl}
      className={className}
      style={combinedStyle}
      {...rest}
    >
      {container ? <Container>{children}</Container> : children}
    </Box>
  );
};

//
// Heading slot: just re‐expose your old HeadingComponent
// but wrapped in Box for spacing and dark‐mode support.
//
interface HeadingProps {
  as?: 'h1'|'h2'|'h3'|'h4'|'h5'|'h6';
  spacing?: string;
  className?: string;
  dark?: boolean;
  children: ReactNode;
}

const Heading: React.FC<HeadingProps> = ({
  as = 'h4',
  spacing = 'pt-2 pb-1',
  className,
  dark = false,
  children,
}) => (
  <Box as={as} padding={spacing}>
    <HeadingComponent as={as} onDark={dark} className={className}>
      {children}
    </HeadingComponent>
  </Box>
);

//
// Text slot: likewise
//
interface TextProps {
  as?: 'p'|'div';
  spacing?: string;
  className?: string;
  children: ReactNode;
}

const Text: React.FC<TextProps> = ({
  as = 'p',
  spacing = 'py-1',
  className,
  children,
}) => (
  <Box as={as} padding={spacing}>
    <TextComponent as={as} className={className}>
      {children}
    </TextComponent>
  </Box>
);

//
// Image slot: nothing special, but we could wrap in Box if you need spacing.
//
interface ImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
}

const Image: React.FC<ImageProps> = ({
  src, alt = '', width, height, className,
}) => (
  <NextImage
    src={src}
    alt={alt}
    width={width}
    height={height}
    className={className}
  />
);

//
// Attach sub‑components
//
Card.Heading = Heading;
Card.Text    = Text;
Card.Image   = Image;

export default Card;
