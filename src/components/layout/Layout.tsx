import { ReactNode } from 'react';

import { Footer, Header } from '@/components/layout';

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
