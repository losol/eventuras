import { EventInfoStatus } from '@eventuras/sdk';
import { Container, Heading, Text } from '@eventuras/ui';
import { Logger } from '@eventuras/utils';
import { redirect } from 'next/navigation';
import createTranslation from 'next-translate/createTranslation';

import EventDetails from '@/app/events/EventDetails';
import EventRegistrationButton from '@/app/events/EventRegistrationButton';
import Card from '@/components/Card';
import Wrapper from '@/components/eventuras/Wrapper';
import Link from '@/components/Link';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import { formatDateSpan } from '@/utils/formatDate';

type EventInfoProps = {
  params: {
    id: number;
    slug: string;
  };
};

export const revalidate = 300;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dynamicParams = true;

export async function generateStaticParams() {
  const orgId = parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID);

  Logger.info(
    { namespace: 'events:staticparams' },
    `Api Base url: ${Environment.NEXT_PUBLIC_BACKEND_URL}, orgId: ${orgId})`
  );

  const eventuras = createSDK({ inferUrl: true });
  const eventInfos = await eventuras.events.getV3Events({
    organizationId: orgId,
  });

  if (!eventInfos) return [];

  if (eventInfos.data) {
    const staticParams = eventInfos.data.map(eventInfo => ({
      id: eventInfo.id?.toString(),
      slug: eventInfo.slug,
    }));
    Logger.info({ namespace: 'events:staticparams' }, 'Static params:', staticParams);
    return staticParams;
  }

  return [];
}

const Page: React.FC<EventInfoProps> = async ({ params }) => {
  const { t } = createTranslation();
  const result = await apiWrapper(() =>
    createSDK({ inferUrl: true }).events.getV3Events1({ id: params.id })
  );

  let notFound = !result.ok || !result.value;
  // Also show the not found page, if EventInfoStatus is Draft
  if (result.value?.status === EventInfoStatus.DRAFT) {
    notFound = true;
  }

  if (notFound)
    return (
      <>
        <Heading>{t('common:events.detailspage.notfound.title')}</Heading>
        <Text className="py-6">{t('common:events.detailspage.notfound.description')}</Text>
        <Link href="/" variant="button-primary">
          {t('common:events.detailspage.notfound.back')}
        </Link>
      </>
    );

  const eventinfo = result.value!;
  if (params.slug !== eventinfo.slug) {
    redirect(`/events/${eventinfo.id!}/${eventinfo.slug!}`);
  }

  const hasFeaturedImage = eventinfo.featuredImageUrl ? true : false;

  return (
    <Wrapper imageNavbar={hasFeaturedImage} bgDark={hasFeaturedImage} fluid>
      {eventinfo?.featuredImageUrl && (
        <Card
          className="mx-auto min-h-[33vh]"
          {...(eventinfo?.featuredImageUrl && { backgroundImage: eventinfo.featuredImageUrl })}
        ></Card>
      )}
      <section className="py-16">
        <Container>
          <Heading as="h1" spacingClassName="pt-6 pb-3">
            {eventinfo?.title ?? 'Mysterious Event'}
          </Heading>
          {eventinfo.headline && (
            <Heading
              as="h2"
              className="text-xl font-semibold text-gray-700"
              spacingClassName="py-3"
            >
              &mdash; {eventinfo.headline}
            </Heading>
          )}

          <Text text={eventinfo.description} className="py-3" />
          <Text
            text={formatDateSpan(eventinfo.dateStart as string, eventinfo.dateEnd as string, {
              locale: Environment.NEXT_PUBLIC_DEFAULT_LOCALE,
            })}
            className="py-3"
          />

          {eventinfo?.city}
          <EventRegistrationButton event={eventinfo!} />
        </Container>
      </section>

      <EventDetails eventinfo={eventinfo} />
    </Wrapper>
  );
};

export default Page;
