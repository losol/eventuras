import { default as NextImage } from 'next/image';
import React, { ReactNode } from 'react';

import { default as TextComponent } from '@/components/ui/Text';

import { default as HeadingComponent } from './Heading';

interface CardChildProps {
  type?: 'Heading' | 'Text' | 'Image';
  className?: string;
  spacingClassName?: string;
  dark?: boolean;
}

interface HeadingProps extends CardChildProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: ReactNode;
}

interface TextProps extends CardChildProps {
  children: ReactNode;
}

interface ImageProps extends CardChildProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface CardProps {
  children: ReactNode;
  className?: string;
  backgroundImage?: string;
  block?: boolean;
  dark?: boolean;
}

const Card = (props: CardProps) => {
  // Filter out and render only valid child elements
  const renderedChildren = React.Children.map(props.children, child => {
    if (React.isValidElement<HeadingProps | TextProps | ImageProps>(child)) {
      return React.cloneElement(child, { dark: props.dark });
    }
    return null; // Ignore other types of children
  });

  const baseClassName = props.className ?? `relative p-3 bg-white `;

  // Conditionally add 'w-full h-full' if block is true
  const blockClass = props.block ? 'w-full h-full' : 'max-w-md';

  // Conditionally set text color
  const textColor = props.dark ? 'text-gray-100' : 'text-gray-800 dark:text-gray-200';

  // Combine baseClassName with blockClass
  const cardClassName = `${baseClassName} ${textColor} ${blockClass}`;

  // Conditionally add backgroundImage style
  const cardStyle: React.CSSProperties = props.backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 80, 0.8), rgba(0, 0, 190, 0.5)), url(${props.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {};

  return (
    <div className={cardClassName} style={cardStyle}>
      {renderedChildren}
    </div>
  );
};

// Heading component
const Heading: React.FC<HeadingProps> = ({
  as = 'h4',
  children,
  className,
  spacingClassName,
  dark,
}) => (
  <HeadingComponent as={as} dark={dark} className={className} spacingClassName={spacingClassName}>
    {children}
  </HeadingComponent>
);

// Text component
const Text: React.FC<TextProps> = ({ children, className, spacingClassName }) => (
  <TextComponent as="p" className={className} spacingClassName={spacingClassName}>
    {children}
  </TextComponent>
);

// Image component
const Image: React.FC<ImageProps> = props => (
  <NextImage
    src={props.src}
    alt={props.alt ?? ''}
    width={props.width}
    height={props.height}
    className="-px-2"
  />
);

// Define valid child types after the components are defined
Card.Heading = Heading;
Card.Text = Text;
Card.Image = Image;

export default Card;
