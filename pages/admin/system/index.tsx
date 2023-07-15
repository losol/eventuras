import { Container, Heading } from '@chakra-ui/react';
import {
  DataTable,
  Layout,
  Link,
  Loading,
  Unauthorized,
} from '@components/common';
import { getOrganisationSettings } from '@lib/Organisation';
import { useSession } from 'next-auth/client';
import React, { useEffect, useState } from 'react';

const SystemAdminIndex = () => {
  const [session, loading] = useSession();
  const [settings, setSettings] = useState([]);
  const orgId = parseInt(process.env.NEXT_PUBLIC_ORGANIZATION_ID);
  const columns = [
    {
      Header: 'Name',
      accessor: 'name',
    },
    {
      Header: 'Value',
      accessor: 'value',
    },
  ];

  useEffect(() => {
    if (session) {
      const fetchSetting = async () => {
        const result = await getOrganisationSettings(
          orgId,
          session.accessToken
        );
        console.log(result);
        setSettings(result);
      };
      fetchSetting();
    }
  }, [session]);

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

  return (
    <Layout>
      <Container paddingTop="32">
        <Heading as="h1" paddingBottom="16">
          <Link href="/admin/">Admin</Link> &gt; System
        </Heading>
        <Heading as="h2">Organisation settings</Heading>
        <DataTable columns={columns} data={settings} />
      </Container>
    </Layout>
  );
};

export default SystemAdminIndex;
