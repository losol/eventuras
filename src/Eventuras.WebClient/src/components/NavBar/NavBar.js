import { Flex, Heading, useColorModeValue } from "@chakra-ui/react";

import ColorModeToggler from "../../components/ColorModeToggler/ColorModeToggler";
import React from "react";

const NavBar = (props) => {
  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1.5rem"
      bg={useColorModeValue("gray.100", "gray.900")}
      color={useColorModeValue("gray.600", "gray.300")}
      {...props}
    >
      <Flex align="center" mr={5}>
        <Heading as="h1" size="lg" letterSpacing={"-.1rem"}>
          Eventuras
        </Heading>
      </Flex>

      <ColorModeToggler />
    </Flex>
  );
};

export default NavBar;
