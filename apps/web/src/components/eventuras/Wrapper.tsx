import { getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';

import {Footer} from '@eventuras/ratio-ui/core/Footer';
import {Navbar} from '@eventuras/ratio-ui/core/Navbar';
import {List} from '@eventuras/ratio-ui/core/List';
import getSiteSettings from '@/utils/site/getSiteSettings';

import UserMenu from './UserMenu';
import Link from 'next/link';

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
  mainClassName: 'container mx-auto',
  fluidMainClassName: 'm-0',
};

const Wrapper = async (props: WrapperProps) => {
  const t = await getTranslations();
  const site = await getSiteSettings();
  const bgClass = props.imageNavbar
    ? 'bg-transparent z-10 absolute w-full py-1'
    : 'bg-transparent w-full py-1';

  const mainClassName = (await props.fluid) ? styles.fluidMainClassName : styles.mainClassName;

  return (
    <>
      <Navbar
        title={site?.name ?? 'Eventuras'}
        bgColor={bgClass}
        bgDark={props.bgDark}
        LinkComponent={Link}
      >
        <UserMenu
          loggedInContent={{
            accountLabel: t('common.labels.account'),
            adminLabel: t('common.labels.admin'),
            logoutButtonLabel: t('common.labels.logout'),
            userLabel: t('common.labels.user'),
          }}
          LoggedOutContent={{
            loginLabel: t('common.labels.login'),
          }}
        />
      </Navbar>
      <main id="main-content" className={mainClassName}>
        {props.children}
      </main>
      <Footer siteTitle={site?.name} publisher={site?.publisher}>
        <List className="list-none text-gray-800 dark:text-gray-300 font-medium">
          {site?.footerLinks?.map((link, idx) => (
            <List.Item key={link.href ?? idx} className="mb-4">
              <Link href={link.href}>{link.text}</Link>
            </List.Item>
          ))}
        </List>
      </Footer>
    </>
  );
};

export default Wrapper;
