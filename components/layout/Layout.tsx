import { Footer, Header } from 'components/layout';
import { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
};

const Layout = (props: LayoutProps) => {
  const { children } = props;
  return (
    <>
      <Header title="Eventuras" />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
