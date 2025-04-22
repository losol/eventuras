import { Section, Heading, Text } from '@eventuras/ratio-ui';
import { getTranslations } from 'next-intl/server';

import { EventGrid } from '@/components/event';
import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import getSiteSettings from '@/utils/site/getSiteSettings';

const ORGANIZATION_ID = Number(Environment.NEXT_PUBLIC_ORGANIZATION_ID);

export default async function Homepage() {
  const site = await getSiteSettings();
  const t = await getTranslations();
  const result = await apiWrapper(() =>
    createSDK({ inferUrl: true }).events.getV3Events({ organizationId: ORGANIZATION_ID })
  );

  return (
    <Wrapper imageNavbar bgDark fluid>
      {/* Hero section with background image */}
      <Section
        backgroundImageUrl="/assets/images/mountains.jpg"
        backgroundColorClass="dark:bg-black/60"
        padding="pt-32 pb-8"
        className="text-white"
        container
      >
        <Heading as="h1" padding="pb-4" onDark>
          {site?.frontpage.title ?? 'Eventuras'}
        </Heading>
        <Text padding="pb-2">{site?.frontpage.introduction ?? 'Eventuras for your life!'}</Text>
      </Section>

      {/* Events section */}
      {result.value?.data?.length ? (
        <Section bgColorClass="bg-primary-50 dark:bg-slate-950" padding="pt-16 pb-24" container>
          <Heading as="h2" padding="pb-6">
            {t('common.events.sectiontitle')}
          </Heading>
          <EventGrid eventinfos={result.value.data} />
        </Section>
      ) : null}
    </Wrapper>
  );
}
