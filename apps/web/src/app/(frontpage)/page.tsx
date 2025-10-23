import { getTranslations } from 'next-intl/server';

import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Section } from '@eventuras/ratio-ui/layout/Section';

import { EventGrid } from '@/components/event';
import UserMenu from '@/components/eventuras/UserMenu';
import { appConfig } from '@/config.server';
import { getV3Events, publicClient } from '@/lib/eventuras-public-sdk';
import getSiteSettings from '@/utils/site/getSiteSettings';

const ORGANIZATION_ID = Number(appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID as string);
// Incremental Static Regeneration - revalidate every 5 minutes
export const revalidate = 300;
export default async function Homepage() {
  const site = await getSiteSettings();
  const t = await getTranslations();
  // Use public client for anonymous API access (ISR-safe)
  const response = await getV3Events({
    client: publicClient,
    query: { OrganizationId: ORGANIZATION_ID },
  });
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
      {response.data?.data?.length ? (
        <Section backgroundColorClass="bg-primary-50 dark:bg-slate-950" padding="py-8" container>
          <Heading as="h2" padding="pb-6">
            {t('common.events.sectiontitle')}
          </Heading>
          <EventGrid eventinfos={response.data.data} />
        </Section>
      ) : null}
    </>
  );
}
