import { Container, Footer, Header } from 'components/layout';
import { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="relative flex h-screen min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Container>{children}</Container>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
