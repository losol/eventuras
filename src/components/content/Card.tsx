import { default as NextImage } from 'next/image';
import React, { ReactNode } from 'react';

import { default as HeadingComponent } from './Heading';

interface CardChildProps {
  type?: 'Heading' | 'Text' | 'Image';
  className?: string;
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
}

const Card = (props: CardProps) => {
  // Filter out and render only valid child elements
  const renderedChildren = React.Children.map(props.children, child => {
    if (React.isValidElement<HeadingProps | TextProps | ImageProps>(child)) {
      return child;
    }
    return null; // Ignore other types of children
  });

  const cardClassName =
    props.className ??
    `relative max-w-md p-3 bg-white  text-gray-800 dark:text-gray-200 dark:bg-gray-900`;

  return <div className={cardClassName}>{renderedChildren}</div>;
};

// Heading component
const Heading: React.FC<HeadingProps> = ({ as = 'h4', children }) => (
  <HeadingComponent as={as}>{children}</HeadingComponent>
);

// Text component
const Text: React.FC<TextProps> = ({ children }) => <p className="mb-3 font-normal">{children}</p>;

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
