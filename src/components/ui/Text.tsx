import React from 'react';

import { TEST_ID_ATTRIBUTE } from '@/utils/constants';

interface TextProps {
  children?: React.ReactNode;
  text?: string | null | undefined;
  as?: 'div' | 'span' | 'p';
  className?: string;
  spacingClassName?: string;
  [TEST_ID_ATTRIBUTE]?: string;
}

const Text: React.FC<TextProps> = props => {
  const { as: Component = 'div', className = '', spacingClassName = '', children, text } = props;
  // Throw an error if both text and children are provided
  if (text !== undefined && children !== undefined) {
    throw new Error(
      'Text component cannot take both `text` and `children` props. Please provide only one.'
    );
  }

  // Return null if neither text nor children is provided
  if (text === undefined && children === undefined) {
    return null;
  }

  // Decide what to render, text prop or children
  const content = text ?? children;

  return (
    <Component
      className={`${className} ${spacingClassName}`.trim()}
      data-test-id={props[TEST_ID_ATTRIBUTE]}
    >
      {content}
    </Component>
  );
};

export default Text;
