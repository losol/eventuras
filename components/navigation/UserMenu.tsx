import { Button, Menu } from '@mantine/core';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

type UserMenuProps = {
  signOut(): void;
  name?: string;
};

const UserMenu = (props: UserMenuProps) => {
  const { signOut } = props;
  const { t } = useTranslation('common');

  return (
    <Menu>
      <Menu.Target>
        <Button>Menu</Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Link href="/user" passHref>
          <Menu.Item>{t('header.userMenu.title')}</Menu.Item>
        </Link>

        <Link href="/user/profile" passHref>
          <Menu.Item>{t('header.userMenu.profile')}</Menu.Item>
        </Link>

        <Link href="/admin" passHref>
          <Menu.Item>{t('header.userMenu.admin')}</Menu.Item>
        </Link>

        <Menu.Item onClick={signOut}>{t('header.auth.logout')}</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default UserMenu;
