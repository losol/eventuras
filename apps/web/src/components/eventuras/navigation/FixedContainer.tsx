import { ReactNode } from 'react';

type FixedContainerProps = {
  children: ReactNode;
};

const FixedContainer = async (props: FixedContainerProps) => (
  <div className="container pb-20">{props.children}</div>
);

export default FixedContainer;
