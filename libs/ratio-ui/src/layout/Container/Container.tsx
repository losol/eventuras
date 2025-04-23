import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  as?: 'div' | 'section';
  className?: string;
}

const Container: React.FC<ContainerProps> = ({
  children,
  as: Component = 'div',
  className = '',
  ...rest
}) => {
  return (
    <Component className={`p-3 container mx-auto ${className}`} {...rest}>
      {children}
    </Component>
  );
};

export default Container;
