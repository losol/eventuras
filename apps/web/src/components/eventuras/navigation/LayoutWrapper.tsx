import { Footer } from '@eventuras/ui';
import Navbar from '@eventuras/ui/Navbar';
import createTranslation from 'next-translate/createTranslation';
import { ReactNode } from 'react';

import getSiteSettings from '@/utils/site/getSiteSettings';

import { UserMenu } from './UserMenu';

/**
 * Layout component wrapping main content with Header and Footer.
 * @param {{ children: ReactNode }} props - Layout properties.
 * @returns {JSX.Element} The rendered Layout component.
 *
 *
 *
 */

type LayoutWrapperProps = {
  children: ReactNode;
  imageNavbar?: boolean;
  darkImage?: boolean;
};

const LayoutWrapper = async (props: LayoutWrapperProps) => {
  const { t } = createTranslation();
  const site = await getSiteSettings();
  const bgClass = props.imageNavbar
    ? 'bg-transparent z-10 absolute w-full py-1'
    : 'bg-transparent w-full py-1';

  return (
    <>
      <Navbar title={site?.name ?? 'Eventuras'} bgColor={bgClass} bgDark={props.darkImage}>
        <UserMenu
          loggedInContent={{
            accountLabel: t('common:labels.account'),
            adminLabel: t('common:labels.admin'),
            logoutButtonLabel: t('common:labels.logout'),
            userLabel: t('common:labels.user'),
          }}
          LoggedOutContent={{
            loginLabel: t('common:labels.login'),
          }}
        />
      </Navbar>
      <main id="main-content">{props.children}</main>
      <Footer siteTitle={site?.name} links={site?.footerLinks} publisher={site?.publisher} />
    </>
  );
};

export default LayoutWrapper;
