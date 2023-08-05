import { default as NextImage } from 'next/image';
import React, { ReactNode } from 'react';

interface CardChildProps {
  type?: 'Heading' | 'Text' | 'Image';
  children: ReactNode;
  className?: string;
}

interface HeadingProps extends CardChildProps {}

interface TextProps extends CardChildProps {}

interface ImageProps extends CardChildProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface CardProps {
  children: ReactNode;
}

const Card = (props: CardProps) => {
  // Filter out and render only valid child elements
  const renderedChildren = React.Children.map(props.children, child => {
    if (React.isValidElement<HeadingProps | TextProps | ImageProps>(child)) {
      return child;
    }
    return null; // Ignore other types of children
  });

  return (
    <div className="max-w-md p-3 bg-white border border-gray-200 rounded-md shadow dark:bg-gray-800 dark:border-gray-700">
      {renderedChildren}
    </div>
  );
};

// Heading component
const Heading: React.FC<HeadingProps> = ({ children }) => (
  <h4 className="mb-2 text-2xl font-bold tracking-tight">{children}</h4>
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
