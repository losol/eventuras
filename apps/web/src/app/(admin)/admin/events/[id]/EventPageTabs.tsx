'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Tabs } from '@eventuras/ratio-ui/core/Tabs';

import EventEditor from '@/app/(admin)/admin/events/EventEditor';
import { EventDto, EventStatisticsDto, ProductDto, RegistrationDto } from '@/lib/eventuras-sdk';

import ParticipantsSection from './ParticipantsSection';

type EventPageTabsProps = {
  eventinfo: EventDto;
  participants: RegistrationDto[];
  statistics: EventStatisticsDto;
  eventProducts: ProductDto[];
  defaultTab?: 'participants' | 'edit' | 'products';
};

export default function EventPageTabs({
  eventinfo,
  participants,
  statistics,
  eventProducts,
  defaultTab = 'participants',
}: EventPageTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();

  // Get current tab from URL or use default
  const currentTab = searchParams.get('tab') || defaultTab;

  const handleTabChange = (newTab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs selectedKey={currentTab} onSelectionChange={handleTabChange}>
      <Tabs.Item
        id="participants"
        title={t('admin.events.tabs.participants')}
        testId="tab-participants"
      >
        <ParticipantsSection
          eventInfo={eventinfo}
          participants={participants}
          statistics={statistics}
          eventProducts={eventProducts}
        />
      </Tabs.Item>

      <Tabs.Item id="edit" title={t('admin.events.tabs.edit')} testId="tab-edit">
        <EventEditor eventinfo={eventinfo} />
      </Tabs.Item>

      <Tabs.Item id="products" title={t('admin.events.tabs.products')} testId="tab-products">
        <div className="text-gray-600 dark:text-gray-400">
          <p>Products management coming soon...</p>
          <p className="mt-2 text-sm">
            For now, use the{' '}
            <a
              href={`/admin/events/${eventinfo.id}/products`}
              className="text-primary-600 hover:underline"
            >
              dedicated products page
            </a>
            .
          </p>
        </div>
      </Tabs.Item>
    </Tabs>
  );
}
