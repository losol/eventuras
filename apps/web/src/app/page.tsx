import { getV3Events } from '@eventuras/registrations-sdk';
import { Container, Heading } from '@eventuras/ui';
import createTranslation from 'next-translate/createTranslation';

import Card from '@/components/Card';
import { EventGrid } from '@/components/event';
import Wrapper from '@/components/eventuras/Wrapper';
import { createEventurasClient } from '@/utils/api/EventurasClient';
import Environment from '@/utils/Environment';
import getSiteSettings from '@/utils/site/getSiteSettings';

// Get events from eventuras
const ORGANIZATION_ID: number = parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID);

export default async function Homepage() {
  const site = await getSiteSettings();
  const { t } = createTranslation();
  /*
  const result = await apiWrapper(() =>
    createSDK({ inferUrl: true }).events.getV3Events({
      organizationId: ORGANIZATION_ID,
    })
  );
  const result = await getV3Events({ query: { OrganizationId: ORGANIZATION_ID } });

above is the old' sdk method, below the newer method through openapi-ts (@eventuras/registrations-sdk)
  */
  const client = createEventurasClient({ inferUrl: true });
  const { error, data } = await getV3Events({ client, query: { OrganizationId: ORGANIZATION_ID } });
  if (error) {
    return <p>{error.toString()}</p>;
  }
  return (
    <Wrapper imageNavbar bgDark fluid>
      <section>
        <Card backgroundImage="/assets/images/mountains.jpg" dark block>
          <Card.Heading as="h1" spacingClassName="container pt-32">
            {site?.frontpage.title ?? 'Eventuras'}
          </Card.Heading>
          <Card.Text spacingClassName="container pb-8">
            {site?.frontpage.introduction ?? 'Eventuras for your life!'}
          </Card.Text>
        </Card>
      </section>
      {data && data.data!.length && (
        <section className="bg-primary-50 dark:bg-slate-950 pt-16 pb-24">
          <Container as="section">
            <Heading as="h2">{t('common:events.sectiontitle')}</Heading>
            <EventGrid eventinfos={data.data!} />
          </Container>
        </section>
      )}
    </Wrapper>
  );
}
