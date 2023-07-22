import {
  Avatar,
  Button,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';

type UserMenuProps = {
  signOut: () => void;
  name: string;
};

const UserMenu = (props: UserMenuProps) => {
  const { signOut, name } = props;
  const { t } = useTranslation('common');

  return (
    <>
      <Menu>
        <MenuButton as={Button} colorScheme="teal" size="lg" variant="outline">
          <Wrap>
            <WrapItem>
              <Avatar name={name} size="xs" />
            </WrapItem>
            <WrapItem>{t('header.userMenu.title')}</WrapItem>
          </Wrap>
        </MenuButton>
        <MenuList>
          <MenuItem minH="48px">
            <Link href="/user/">{t('header.userMenu.title')}</Link>
          </MenuItem>
          <MenuItem minH="48px">
            <Link href="/user/profile">{t('header.userMenu.profile')}</Link>
          </MenuItem>
          <MenuItem minH="48px">
            <Link href="/admin/">{t('header.userMenu.admin')}</Link>
          </MenuItem>
          <MenuItem>
            <Link onClick={signOut}>{t('header.auth.logout')}</Link>
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
};

export default UserMenu;
