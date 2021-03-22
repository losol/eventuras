import { Button, Flex, Heading, useColorModeValue } from "@chakra-ui/react";
import { Link, UserMenu } from "..";
import { signIn, signOut, useSession } from "next-auth/client";

import React from "react";

const Header = (props) => {
  const [session, loading] = useSession();

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1.5rem"
      bg={useColorModeValue("gray.100", "gray.900")}
      color={useColorModeValue("gray.600", "gray.300")}
    >
      <Flex align="center" mr={5}>
        <Heading as="h1" size="lg" letterSpacing={"-.1rem"}>
          <Link href="/">Eventuras</Link>
        </Heading>
      </Flex>

      {!session && (
        <Button
          onClick={() => signIn("auth0")}
          colorScheme="teal"
          variant="outline"
        >
          Logg på
        </Button>
      )}
      {session && <UserMenu signOut={signOut} name={session.user.name} />}
    </Flex>
  );
};

export default Header;
