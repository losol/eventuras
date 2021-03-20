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
} from "@chakra-ui/react";

import { ColorModeToggler } from "..";
import React from "react";

const UserMenu = (props) => {
  const { signOut } = props;
  return (
    <>
      <Menu>
        <MenuButton as={Button} colorScheme="teal" size="lg" variant="outline">
          <Wrap>
            <WrapItem>
              <Avatar name={props.name} size="xs" />
            </WrapItem>
            <WrapItem>Profil</WrapItem>
          </Wrap>
        </MenuButton>
        <MenuList>
          <MenuItem minH="48px">
            <Link href="/user/">Mine kurs</Link>
          </MenuItem>
          <MenuItem minH="48px">
            <Link href="/user/profile">Min profil</Link>
          </MenuItem>
          <MenuItem minH="48px">
            <Link href="/admin/">Admin</Link>
          </MenuItem>

          <MenuItem>
            <ColorModeToggler />
          </MenuItem>
          <MenuItem>
            <Link onClick={() => signOut()}>Logg av</Link>
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
};

export default UserMenu;
