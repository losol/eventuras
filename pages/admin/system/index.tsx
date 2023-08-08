/* eslint-disable react-hooks/exhaustive-deps */

import { OrganizationSettingDto, OrganizationSettingsService } from '@losol/eventuras';
import { DataTable, Heading } from 'components/content';
import { Loading, Unauthorized } from 'components/feedback';
import { Container, Layout } from 'components/layout';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const SystemAdminIndex = () => {
  const { data: session, status } = useSession();
  const [settings, setSettings] = useState<OrganizationSettingDto[]>([]);
  let orgId = 1;
  if (process.env.NEXT_PUBLIC_ORGANIZATION_ID !== undefined) {
    orgId = parseInt(process.env.NEXT_PUBLIC_ORGANIZATION_ID.toString());
  }

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
        const result = await OrganizationSettingsService.getV3OrganizationsSettings({
          organizationId: orgId,
        });
        setSettings(result);
      };
      fetchSetting();
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  if (!session)
    return (
      <Layout>
        <Unauthorized />
      </Layout>
    );

  return (
    <Layout>
      <Container>
        <Heading as="h1">
          <Link href="/admin/">Admin</Link> &gt; System
        </Heading>
        <Heading as="h2">Organisation settings</Heading>
        <DataTable columns={columns} data={settings} />
      </Container>
    </Layout>
  );
};

export default SystemAdminIndex;
