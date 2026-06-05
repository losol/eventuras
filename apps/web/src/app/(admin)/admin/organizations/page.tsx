import { getTranslations } from 'next-intl/server';

import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { List } from '@eventuras/ratio-ui/core/List';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { getV3Organizations } from '@/lib/eventuras-sdk';

import { CreateOrganization } from './CreateOrganization';

const AdminOrganizationsPage = async () => {
  const t = await getTranslations();
  const organizations = await getV3Organizations();
  return (
    <>
      <Section className="py-8">
        <Container>
          <div className="flex items-center justify-between gap-4">
            <Heading as="h1">{t('admin.organizations.page.title')}</Heading>
            <CreateOrganization />
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <List>
            {organizations?.data?.map(org => (
              <List.Item key={org.organizationId}>
                <Link href={`/admin/organizations/${org.organizationId}`}>{org.name}</Link>
              </List.Item>
            ))}
          </List>
        </Container>
      </Section>
    </>
  );
};

export default AdminOrganizationsPage;
