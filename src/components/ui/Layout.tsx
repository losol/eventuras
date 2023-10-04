import { ReactNode } from 'react';

import { Footer, Header } from '@/components/ui';
import getSiteSettings from '@/utils/site/getSiteSettings';

type LayoutProps = {
  children: ReactNode;
};

export default async function Layout(props: LayoutProps) {
  const { children } = props;
  const site = await getSiteSettings();

  return (
    <>
      <Header title={site?.name ?? 'Eventuras'} />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
