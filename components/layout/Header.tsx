import { Flex } from '@mantine/core';
import { Button } from 'components/inputs';
import { UserMenu } from 'components/navigation';
import { Heading } from 'components/typography';
import { signIn, signOut, useSession } from 'next-auth/react';
import useTranslation from 'next-translate/useTranslation';

const Header = () => {
  const { data: session } = useSession();
  const { t } = useTranslation('common');

  return (
    <Flex align="center" justify="space-between" wrap="wrap">
      <Flex align="center" mr={5}>
        <Heading as="h1">Eventuras</Heading>
      </Flex>

      <div>
        {!session && <Button onClick={() => signIn('auth0')}>{t('header.auth.login')}</Button>}
        {session && <UserMenu signOut={signOut} name={session.user?.name ?? ''} />}
      </div>
    </Flex>
  );
};

export default Header;
