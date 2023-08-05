import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
}

const Card = (props: CardProps) => {
  // Loop through the children and render them based on their types
  const renderedChildren = React.Children.map(props.children, child => {
    if (React.isValidElement(child) && (child.type === Card.Heading || child.type === Card.Text)) {
      return <>{child}</>;
    }
    return null; // Ignore other types of children
  });

  return (
    <div className="max-w-md p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      {renderedChildren}
    </div>
  );
};

interface HeadingProps {
  children: ReactNode;
}
const Heading: React.FC<HeadingProps> = ({ children }) => (
  <h4 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
    {children}
  </h4>
);
Card.Heading = Heading;

interface TextProps {
  children: ReactNode;
}
const Text: React.FC<TextProps> = ({ children }) => (
  <p className="mb-3 font-normal text-gray-500 dark:text-gray-400">{children}</p>
);
Card.Text = Text;

export default Card;
