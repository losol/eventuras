import { ReactNode } from 'react';
import { Header } from 'components';

type LayoutProps = {
  children: ReactNode;
};

const Layout = (props: LayoutProps) => {
  const { children } = props;
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
};

export default Layout;
