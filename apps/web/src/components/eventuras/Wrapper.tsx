import { getCurrentSession } from '@eventuras/fides-auth/session';
import createTranslation from 'next-translate/createTranslation';
import { ReactNode } from 'react';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { authConfig } from '@/utils/authconfig';
import { getAccessToken } from '@/utils/getAccesstoken';
import getSiteSettings from '@/utils/site/getSiteSettings';

import { UserMenu } from './navigation/UserMenu';

/**
 * Layout component wrapping main content with Header and Footer.
 * @param {{ children: ReactNode }} props - Layout properties.
 * @returns {JSX.Element} The rendered Layout component.
 */

type WrapperProps = {
  children: ReactNode;
  imageNavbar?: boolean;
  bgDark?: boolean;
  fluid?: boolean;
};

const styles = {
  mainClassName: 'container mx-auto pb-20',
  fluidMainClassName: 'm-0 pb-20',
};

const Wrapper = async (props: WrapperProps) => {
  const { t } = createTranslation();
  const site = await getSiteSettings();
  const session = await getCurrentSession();
  const bgClass = props.imageNavbar
    ? 'bg-transparent z-10 absolute w-full py-1'
    : 'bg-transparent w-full py-1';

  const mainClassName = props.fluid ? styles.fluidMainClassName : styles.mainClassName;

  return (
    <>
      <Navbar title={site?.name ?? 'Eventuras'} bgColor={bgClass} bgDark={props.bgDark}>
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
          isLoggedIn={session !== null}
          isAdmin={session?.user?.roles?.includes('Admin')}
          userName={session?.user?.name}
        />
      </Navbar>
      <main id="main-content" className={mainClassName}>
        {props.children}
      </main>
      <Footer siteTitle={site?.name} links={site?.footerLinks} publisher={site?.publisher} />
    </>
  );
};

export default Wrapper;
