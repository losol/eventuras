import {
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import useTranslation from 'next-translate/useTranslation';

type UserMenuProps = {
<<<<<<< HEAD
  signOut(): void;
  name: string;
=======
  signOut: () => void;
  name: string | null | undefined;
>>>>>>> 860bece (refactor: lint all files to new standard)
};

const UserMenu = (props: UserMenuProps) => {
  const { signOut, name } = props;
  const { t } = useTranslation('common');

  return (
<<<<<<< HEAD
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
        <NextLink href="/user" passHref>
          <MenuItem as="div" minH="48px">
            {t('header.userMenu.title')}
=======
    <>
      <Menu>
        <MenuButton as={Button} colorScheme="teal" size="lg" variant="outline">
          <Wrap>
            {name && (
              <WrapItem>
                <Avatar name={name} size="xs" />
              </WrapItem>
            )}
            <WrapItem>{t('header.userMenu.title')}</WrapItem>
          </Wrap>
        </MenuButton>
        <MenuList>
          <MenuItem minH="48px">
            <Link href="/user/">{t('header.userMenu.title')}</Link>
>>>>>>> 860bece (refactor: lint all files to new standard)
          </MenuItem>
        </NextLink>

        <NextLink href="/user/profile" passHref>
          <MenuItem as="div" minH="48px">
            {t('header.userMenu.profile')}
          </MenuItem>
        </NextLink>

        <NextLink href="/admin" passHref>
          <MenuItem as="div" minH="48px">
            {t('header.userMenu.admin')}
          </MenuItem>
        </NextLink>

        <MenuItem as="button" onClick={signOut} minH="48px" color="teal.500">
          {t('header.auth.logout')}
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default UserMenu;
