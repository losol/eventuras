import { Container, Heading, Section } from '@eventuras/ratio-ui';
import { getTranslations } from 'next-intl/server';
import { getV3Organizations } from '@eventuras/event-sdk';

import withAuthorization from '@/utils/auth/withAuthorization';
import {List} from '@eventuras/ratio-ui/core/List';
import { Link } from '@eventuras/ratio-ui-next/Link';

const AdminOrganizationsPage = async () => {
  const t = await getTranslations();

  const organizations = await getV3Organizations();

  return (
    <Section className="py-8">
        <Container>
          <Heading as="h1">{t('admin.organizations.page.title')}</Heading>
        </Container>
      </Section>
      <Section>
        <Container>
          <List>
            {organizations &&
              organizations.data &&
              organizations.data.map(org => (
                <List.Item key={org.organizationId}>
                  <Link href={`/admin/organizations/${org.organizationId}`}>{org.name}</Link>
                </List.Item>
              ))}
          </List>
        </Container>
      </Section>
  );
};

export default withAuthorization(AdminOrganizationsPage, 'Admin');
