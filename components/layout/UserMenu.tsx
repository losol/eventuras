import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type UserMenuProps = {
  signOut(): void;
  name?: string;
};

const UserMenu = ({ signOut }: UserMenuProps) => {
  const { t } = useTranslation('common');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link href="/user">{t('header.userMenu.title')}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin">{t('header.userMenu.admin')}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={signOut}>{t('header.auth.logout')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
