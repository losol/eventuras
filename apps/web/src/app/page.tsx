import { Container, Heading } from '@eventuras/ui';
import { getTranslations } from 'next-intl/server';

import Card from '@/components/Card';
import { EventGrid } from '@/components/event';
import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import getSiteSettings from '@/utils/site/getSiteSettings';

// Get events from eventuras
const ORGANIZATION_ID: number = parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID);

export default async function Homepage() {
  const site = await getSiteSettings();
  const t = await getTranslations();
  //We expect results to be there, the API could only throw 500s here which we do not want to catch anyway
  const result = await apiWrapper(() =>
    createSDK({ inferUrl: true }).events.getV3Events({
      organizationId: ORGANIZATION_ID,
    })
  );

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
      {result.value && result.value!.data!.length && (
        <section className="bg-primary-50 dark:bg-slate-950 pt-16 pb-24">
          <Container as="section">
            <Heading as="h2">{t('common.events.sectiontitle')}</Heading>
            <EventGrid eventinfos={result.value!.data!} />
          </Container>
        </section>
      )}
    </Wrapper>
  );
}
