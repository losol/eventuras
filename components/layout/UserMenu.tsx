import { Button } from 'components/inputs';
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
    <div>
      <Link href="/user">{t('header.userMenu.title')}</Link>
      <Link href="/user">{t('header.userMenu.title')}</Link>
      <Button onClick={signOut}>{t('header.auth.logout')}</Button>
    </div>
  );
};

export default UserMenu;
