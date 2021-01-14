import { Avatar, AvatarBadge } from "@chakra-ui/react";
import {
  Button,
  ChevronDownIcon,
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Wrap,
  WrapItem,
  useColorModeValue,
} from "@chakra-ui/react";

import { ColorModeToggler } from "..";
import Link from "next/link";
import React from "react";

const UserMenu = (props) => {
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
        </MenuList>
      </Menu>
    </>
  );
};

export default UserMenu;
