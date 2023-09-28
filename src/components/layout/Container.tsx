import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  as?: 'div' | 'section';
}

const Container: React.FC<ContainerProps> = ({ children, as: Component = 'div', ...rest }) => {
  return (
    <Component className="container mx-auto" {...rest}>
      {children}
    </Component>
  );
};

export default Container;
