import { Button, Container, Heading } from '@chakra-ui/react';
import { DataTable, Layout, Link, Loading, Text } from '@components/common';
import Unauthorized from '@components/common/Unauthorized/Unauthorized';
import { fetcher } from '@lib/fetcher';
import { getOrganisationSettings } from '@lib/Organisation';
import { useSession } from 'next-auth/client';
import React, { useEffect, useState } from 'react';

const SystemAdminIndex = (): JSX.Element => {
  const [session, loading] = useSession();
  const [settings, setSettings] = useState([]);
  const orgId = parseInt(process.env.NEXT_PUBLIC_ORGANIZATION_ID);

  useEffect(() => {
    if (session) {
      getOrganisationSettings(orgId, session.accessToken).then((settings) => {
        setSettings(settings);
      });
    }
  });

  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  if (!loading && !session)
    return (
      <Layout>
        <Unauthorized />
      </Layout>
    );

  if (session) {
    return (
      <Layout>
        <Container paddingTop="32">
          <Heading as="h1" paddingBottom="16">
            <Link href="/admin/">Admin</Link> &gt; System
          </Heading>
          <Text>{settings && settings}</Text>
        </Container>
      </Layout>
    );
  }
};

export default SystemAdminIndex;
