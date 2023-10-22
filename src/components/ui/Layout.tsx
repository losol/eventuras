/**
 * Layout component wrapping main content with Header and Footer.
 * @param {{ children: ReactNode, fluid?: boolean }} props - Layout properties.
 * @returns {JSX.Element} The rendered Layout component.
 */
import { ReactNode } from 'react';

import { Footer, Header } from '@/components/ui';
import getSiteSettings from '@/utils/site/getSiteSettings';

type LayoutProps = {
  children: ReactNode;
  fluid?: boolean;
};

export default async function Layout(props: LayoutProps) {
  const { children, fluid } = props;
  const site = await getSiteSettings();

  return (
    <>
      <Header title={site?.name ?? 'Eventuras'} />
      <main id="main-content" className={fluid ? '' : 'container'}>
        {children}
      </main>
      <Footer />
    </>
  );
}
