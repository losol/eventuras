import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  as?: 'div' | 'section';
}

const Container: React.FC<ContainerProps> = ({ children, as: Component = 'div', ...rest }) => {
  return (
    <Component className="container-lg mx-auto sm:px-2 md:px-4" {...rest}>
      {children}
    </Component>
  );
};

export default Container;
