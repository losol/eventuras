import { Container, Heading } from '@chakra-ui/react';
import { OrganizationSettingDto, OrganizationSettingsService } from '@losol/eventuras';
import { DataTable, Layout, Link, Loading, Unauthorized } from 'components';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
