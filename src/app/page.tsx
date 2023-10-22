import { EventDto, EventsService, OpenAPI } from '@losol/eventuras';
import createTranslation from 'next-translate/createTranslation';

import { EventGrid } from '@/components/event';
import { Container, Layout } from '@/components/ui';
import Card from '@/components/ui/Card';
import Heading from '@/components/ui/Heading';
import Environment, { EnvironmentVariables } from '@/utils/Environment';
import Logger from '@/utils/Logger';
import getSiteSettings from '@/utils/site/getSiteSettings';

// Get events from eventuras
const ORGANIZATION_ID: number = parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID, 10);

export default async function Homepage() {
  const site = await getSiteSettings();
  const { t } = createTranslation('common');
  let eventinfos: EventDto[] = [];
  try {
    //for some reason OpenAPI.BASE gets set to empty when returning to this page..
    // TODO let's rewrite these to use utils/api and be able to set the api without the forwarder
    OpenAPI.BASE = Environment.get(EnvironmentVariables.API_BASE_URL);
    OpenAPI.VERSION = Environment.NEXT_PUBLIC_API_VERSION;
    const response = await EventsService.getV3Events({
      organizationId: ORGANIZATION_ID,
    });
    eventinfos = response.data ?? [];
  } catch (error) {
    Logger.error({ namespace: 'homepage' }, 'Error fetching events:', error);
  }

  return (
    <Layout fluid imageNavbar darkImage>
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
      <section className="bg-primary-50 dark:bg-slate-950 pt-16 pb-24">
        <Container as="section">
          <Heading as="h2">{t('events')}</Heading>
          <EventGrid eventinfos={eventinfos} />
        </Container>
      </section>
    </Layout>
  );
}
