import React from 'react';
import {
  BoxSpacingProps,
  buildSpacingClasses,
} from '../../layout/Box/Box';

export interface TextProps extends BoxSpacingProps {
  text?: string | null;
  children?: React.ReactNode;
  as?: 'div' | 'span' | 'p';
  className?: string;
  icon?: React.ReactNode;
  testId?: string;
}

export const Text: React.FC<TextProps> = ({
  text,
  children,
  as: Component = 'div',
  className = '',
  icon,
  padding,
  margin,
  border,
  width,
  height,
  testId,
  ...restHtmlProps
}) => {
  // 1) Only one of text/children
  if (text != null && children != null) {
    throw new Error(
      "Text component cannot take both `text` and `children`. Please provide only one."
    );
  }
  // 2) Nothing to render?
  if (text == null && children == null) {
    return null;
  }
  const content = text != null ? text : children;

  // 3) Compute spacing
  const spacingCls = buildSpacingClasses({ padding, margin, border, width, height });

  // 4) Final class list
  const classes = [spacingCls, className].filter(Boolean).join(' ');

  return (
    <Component
      className={classes}
      data-testid={testId}
      {...restHtmlProps}
    >
      {icon && <span className="mr-2 inline-flex items-center">{icon}</span>}
      {content}
    </Component>
  );
};

export default Text;
