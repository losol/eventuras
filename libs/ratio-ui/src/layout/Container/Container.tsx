import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  as?: 'div' | 'section';
  className?: string;
}

export const CONTAINER_CLASSES = 'p-3 container mx-auto';

const Container: React.FC<ContainerProps> = ({
  children,
  as: Component = 'div',
  className = '',
  ...rest
}) => {
  return (
    <Component className={`${CONTAINER_CLASSES} ${className}`} {...rest}>
      {children}
    </Component>
  );
};

export default Container;
