'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Logger } from '@eventuras/logger';
import { Tabs } from '@eventuras/ratio-ui/core/Tabs';
import { Form } from '@eventuras/smartform';
import { useToast } from '@eventuras/toast';

import { publicEnv } from '@/config.client';
import {
  EventDto,
  EventFormDto,
  EventStatisticsDto,
  ProductDto,
  RegistrationDto,
} from '@/lib/eventuras-sdk';
import slugify from '@/utils/slugify';

import CommunicationSection from './CommunicationSection';
import {
  AdvancedSection,
  CertificateSection,
  DatesLocationSection,
  DescriptionsSection,
  OverviewSection,
} from './EventEditorSections';
import ParticipantsSection from './ParticipantsSection';
import EventProductsEditor from './products/EventProductsEditor';
import { updateEvent } from '../actions';

// Auto-save wrapper component that watches form changes
const AutoSaveHandler = ({ onAutoSave }: { onAutoSave: (data: EventFormDto) => void }) => {
  const { watch, getValues } = useFormContext<EventFormDto>();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousValuesRef = useRef<EventFormDto | null>(null);

  useEffect(() => {
    const subscription = watch(() => {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for debounced save
      saveTimeoutRef.current = setTimeout(() => {
        const currentValues = getValues();

        // Only save if values have actually changed
        if (JSON.stringify(currentValues) !== JSON.stringify(previousValuesRef.current)) {
          previousValuesRef.current = currentValues;
          onAutoSave(currentValues);
        }
      }, 1000); // 1 second debounce
    });

    return () => {
      subscription.unsubscribe();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [watch, getValues, onAutoSave]);

  return null;
};

type EventPageTabsProps = {
  eventinfo: EventDto;
  participants: RegistrationDto[];
  statistics: EventStatisticsDto;
  eventProducts: ProductDto[];
  defaultTab?:
    | 'participants'
    | 'overview'
    | 'dates'
    | 'descriptions'
    | 'certificate'
    | 'advanced'
    | 'communication'
    | 'products';
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
  const toast = useToast();

  const logger = Logger.create({
    namespace: 'web:admin:events',
    context: { component: 'EventPageTabs', eventId: eventinfo.id },
  });

  // Get current tab from URL or use default
  const currentTab = searchParams.get('tab') || defaultTab;

  const handleTabChange = (newTab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Auto-save handler
  const handleAutoSave = useCallback(
    async (data: EventFormDto) => {
      logger.info({ autoSave: true }, 'Auto-saving event...');

      const orgId = publicEnv.NEXT_PUBLIC_ORGANIZATION_ID;
      if (!orgId || Number.isNaN(orgId)) {
        logger.error({ orgId }, 'Organization ID is not configured for auto-save');
        toast.error('Configuration error: Organization ID is missing');
        return;
      }

      data.organizationId = orgId;

      // Set slug
      const year = data.dateStart ? new Date(data.dateStart).getFullYear() : undefined;
      const newSlug = slugify([data.title, data.city, year, data.id].filter(Boolean).join('-'));
      data.slug = newSlug;

      const result = await updateEvent(eventinfo.id!, data);

      if (result.success) {
        logger.info({ autoSave: true }, 'Auto-save successful');
        toast.success('Changes saved');
      } else {
        logger.error(
          {
            autoSave: true,
            error: result.error,
          },
          'Auto-save failed'
        );
        toast.error(`Save failed: ${result.error.message}`);
      }
    },
    [eventinfo.id, logger, toast]
  );

  const isEditTab = ['overview', 'dates', 'descriptions', 'certificate', 'advanced'].includes(
    currentTab
  );

  return (
    <Form
      defaultValues={eventinfo}
      testId="event-edit-form"
      shouldUnregister={false}
      onSubmit={() => {
        // No-op: auto-save handles all updates
      }}
    >
      {isEditTab && <AutoSaveHandler onAutoSave={handleAutoSave} />}

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

        <Tabs.Item id="overview" title={t('admin.events.tabs.overview')} testId="tab-overview">
          <OverviewSection />
        </Tabs.Item>

        <Tabs.Item id="dates" title={t('admin.events.tabs.dates')} testId="tab-dates">
          <DatesLocationSection />
        </Tabs.Item>

        <Tabs.Item id="descriptions" title={t('admin.events.tabs.descriptions')} testId="tab-descriptions">
          <DescriptionsSection />
        </Tabs.Item>

        <Tabs.Item id="certificate" title={t('admin.events.tabs.certificate')} testId="tab-certificate">
          <CertificateSection eventinfo={eventinfo} />
        </Tabs.Item>

        <Tabs.Item id="communication" title={t('admin.events.tabs.communication')} testId="tab-communication">
          <CommunicationSection eventinfo={eventinfo} />
        </Tabs.Item>

        <Tabs.Item id="products" title={t('admin.events.tabs.products')} testId="tab-products">
          <EventProductsEditor eventInfo={eventinfo} products={eventProducts} />
        </Tabs.Item>

        <Tabs.Item id="advanced" title={t('admin.events.tabs.advanced')} testId="tab-advanced">
          <AdvancedSection eventId={eventinfo.id} />
        </Tabs.Item>
      </Tabs>
    </Form>
  );
}

