import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";

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
      bg={props.colorMode === "dark" ? "white" : "gray.600"}
      color={props.colorMode === "dark" ? "gray.600" : "white"}
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
