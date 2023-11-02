import createTranslation from 'next-translate/createTranslation';

import { EventGrid } from '@/components/event';
import { Container, Layout } from '@/components/ui';
import Card from '@/components/ui/Card';
import Heading from '@/components/ui/Heading';
import createSDK from '@/utils/createSDK';
import Environment from '@/utils/Environment';
import getSiteSettings from '@/utils/site/getSiteSettings';

// Get events from eventuras
const ORGANIZATION_ID: number = parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID, 10);

export default async function Homepage() {
  const site = await getSiteSettings();
  const { t } = createTranslation();

  const eventuras = createSDK();
  const eventinfos = await eventuras.events.getV3Events({
    organizationId: ORGANIZATION_ID,
  });

  if (!eventinfos || !eventinfos.data || !eventinfos.data.length) {
    return <div>No events</div>;
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
          <Heading as="h2">{t('common:events')}</Heading>
          <EventGrid eventinfos={eventinfos.data} />
        </Container>
      </section>
    </Layout>
  );
}
