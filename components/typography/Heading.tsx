import { Title, TitleOrder } from '@mantine/core';

type HeadingProps = {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
};

const Heading = ({ as = 'h1', children }: HeadingProps) => {
  // cast as prop to Titleorder
  const headingOrder = parseInt(as.replace('h', '')) as TitleOrder;
  return (
    <>
      <Title order={headingOrder}>{children}</Title>
    </>
  );
};

export default Heading;
