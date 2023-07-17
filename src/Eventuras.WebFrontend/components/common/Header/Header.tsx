import { Button, Flex, Heading, useColorModeValue } from '@chakra-ui/react';
import { signIn, signOut, useSession } from 'next-auth/react';
import React, { useEffect } from 'react';

import { Link, UserMenu } from '..';

const Header = (props) => {
  const { data: session } = useSession();

  // TODO: Send user to login page if refresh access token fails
  /*
  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      // Try logging in again...
      signIn('auth0');
    }
  }, [session]);
  */
  
  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1.5rem"
      bg={useColorModeValue('gray.100', 'gray.900')}
      color={useColorModeValue('gray.600', 'gray.300')}
    >
      <Flex align="center" mr={5}>
        <Heading as="h1" size="lg" letterSpacing={'-.1rem'}>
          Eventuras
        </Heading>
      </Flex>

      {!session && (
        <Button
          onClick={() => signIn('auth0')}
          colorScheme="teal"
          variant="outline"
        >
          Logg på
        </Button>
      )}
      {session && <UserMenu signOut={signOut} name={session.user?.name} />}
    </Flex>
  );
};

export default Header;
