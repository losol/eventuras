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
  signOut(): void;
  name: string;
};

const UserMenu = (props: UserMenuProps) => {
  const { signOut, name } = props;
  const { t } = useTranslation('common');

  return (
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
          <MenuItem as="a" minH="48px">
            {t('header.userMenu.title')}
          </MenuItem>
        </NextLink>

        <NextLink href="/user/profile" passHref>
          <MenuItem as="a" minH="48px">
            {t('header.userMenu.profile')}
          </MenuItem>
        </NextLink>

        <NextLink href="/admin" passHref>
          <MenuItem as="a" minH="48px">
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
