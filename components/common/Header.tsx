import { Button, Flex, Heading, useColorModeValue } from '@chakra-ui/react';
import { signIn, signOut, useSession } from 'next-auth/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { UserMenu } from 'components';

const Header = () => {
  const { data: session } = useSession();
  const { locale, locales } = useRouter();

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


      {/* Current language: {locale}
      <br />
      All languages:
      {' '}
      {locales.map(local => local + ', ')}
      <br /> */}

      <NextLink href="/nb" locale="nb">
        NB
      </NextLink>

      <NextLink href="/en" locale="en">
        EN
      </NextLink>

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
