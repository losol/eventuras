import { Flex, Heading, useColorModeValue } from "@chakra-ui/react";

import { ColorModeToggler } from "..";
import Link from "next/link";
import React from "react";

const Header = (props) => {
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
          <Link href="/">Eventuras</Link>
        </Heading>
      </Flex>

      <ColorModeToggler />
    </Flex>
  );
};

export default Header;
