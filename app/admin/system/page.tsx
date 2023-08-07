'use client';

import { OrganizationSettingDto, OrganizationSettingsService } from '@losol/eventuras';
import { DataTable, Heading } from 'components/content';
import { Spinner, Unauthorized } from 'components/feedback';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const ORGANIZATION_ID = process.env.NEXT_PUBLIC_ORGANIZATION_ID;
const _ORG_ID = ORGANIZATION_ID !== undefined ? Number(ORGANIZATION_ID) : 1;
const ORG_ID = { organizationId: _ORG_ID };

const columns = [
  { Header: 'Name', accessor: 'name', id: 'system-col_name' },
  { Header: 'Value', accessor: 'value', id: 'system-col_value' },
];

const SystemAdminPAge = () => {
  const [settings, setSettings] = useState<OrganizationSettingDto[]>([]);

  const { data: session, status } = useSession();

  // TODO : change to SWR
  useEffect(() => {
    async function fetchSettings() {
      try {
        const settings = await OrganizationSettingsService.getV3OrganizationsSettings(ORG_ID);
        setSettings(settings);
      } catch (error) {
        console.warn(error);
      }
    }

    if (session) fetchSettings();
  }, [session]);

  if (status === 'loading') return <Spinner />;
  if (!session) return <Unauthorized />;

  return (
    <>
      <Heading as="h1">
        <Link href="/admin/">Admin</Link> &gt; System
      </Heading>
      <Heading as="h2">Organisation settings</Heading>
      <DataTable columns={columns} data={settings} />
    </>
  );
};

export default SystemAdminPAge;
