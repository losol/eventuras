import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { Logger } from '@eventuras/logger';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Section } from '@eventuras/ratio-ui/layout/Section';

import { EventGrid } from '@/components/event';
import UserMenu from '@/components/eventuras/UserMenu';
import { appConfig } from '@/config.server';
import { getV3Events, publicClient } from '@/lib/eventuras-public-sdk';
import getSiteSettings from '@/utils/site/getSiteSettings';

const logger = Logger.create({ namespace: 'web:frontpage' });

// Incremental Static Regeneration - revalidate every 5 minutes
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    title: site?.frontpage.title ?? 'Eventuras',
    description: site?.frontpage.introduction ?? 'Event management platform',
  };
}

export default async function Homepage() {
  const site = await getSiteSettings();
  const t = await getTranslations();

  // Get and validate organization ID at runtime
  const ORGANIZATION_ID = Number(appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID as string);
  if (!ORGANIZATION_ID || Number.isNaN(ORGANIZATION_ID)) {
    logger.error('NEXT_PUBLIC_ORGANIZATION_ID is not set or invalid');
    return (
      <Section backgroundColorClass="bg-red-50 dark:bg-red-950" padding="py-8" container>
        <Heading as="h2" padding="pb-6">
          Configuration Error
        </Heading>
        <Text>Organization ID is not configured. Please contact the administrator.</Text>
      </Section>
    );
  }

  let response;
  try {
    // Use public client for anonymous API access (ISR-safe)
    response = await getV3Events({
      client: publicClient,
      query: { OrganizationId: ORGANIZATION_ID },
    });

    logger.info(
      {
        hasData: !!response.data,
        dataLength: response.data?.data?.length,
        hasError: !!response.error,
        error: response.error,
      },
      'Frontpage events response'
    );
  } catch (error) {
    logger.error({ error }, 'Failed to fetch events');
    response = { error: 'Failed to fetch events' };
  }

  const hasEvents = response.data?.data && response.data.data.length > 0;
  const hasError = !!response.error;

  return (
    <>
      {/* Hero section with background image */}
      <Section
        backgroundImageUrl="/assets/images/mountains.jpg"
        backgroundColorClass="dark:bg-black/60"
        padding="pt-32 pb-8"
        className="text-white"
        container
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Heading as="h1" padding="pb-4" onDark>
              {site?.frontpage.title ?? 'Eventuras'}
            </Heading>
            <Text padding="pb-2">{site?.frontpage.introduction ?? 'Eventuras for your life!'}</Text>
          </div>
          <div className="ml-4">
            <UserMenu
              translations={{
                loginLabel: t('common.buttons.login'),
                userLabel: t('common.user.profile'),
                accountLabel: t('common.labels.account'),
                adminLabel: t('common.labels.admin'),
              }}
            />
          </div>
        </div>
      </Section>
      {/* Events section */}
      {hasError && (
        <Section backgroundColorClass="bg-red-50 dark:bg-red-950" padding="py-8" container>
          <Heading as="h2" padding="pb-6">
            {t('common.errors.failedToLoadEvents')}
          </Heading>
          <Text>{t('common.errors.tryRefresh')}</Text>
        </Section>
      )}
      {hasEvents && (
        <Section backgroundColorClass="bg-primary-50 dark:bg-slate-950" padding="py-8" container>
          <Heading as="h2" padding="pb-6">
            {t('common.events.sectiontitle')}
          </Heading>
          <EventGrid eventinfos={response.data!.data!} />
        </Section>
      )}
      {!hasError && !hasEvents && (
        <Section backgroundColorClass="bg-gray-50 dark:bg-slate-950" padding="py-8" container>
          <Heading as="h2" padding="pb-6">
            {t('common.events.sectiontitle')}
          </Heading>
          <Text>{t('common.events.noEventsAvailable')}</Text>
        </Section>
      )}
    </>
  );
}
