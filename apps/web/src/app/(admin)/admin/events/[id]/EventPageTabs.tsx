'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Logger } from '@eventuras/logger';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Tabs } from '@eventuras/ratio-ui/core/Tabs';
import { Form } from '@eventuras/smartform';
import { useToast } from '@eventuras/toast';

import { publicEnv } from '@/config.client';
import {
  EventDto,
  EventFormDto,
  EventStatisticsDto,
  NotificationDto,
  ProductDto,
  RegistrationDto,
} from '@/lib/eventuras-sdk';
import slugify from '@/utils/slugify';

import CommunicationSection from './CommunicationSection';
import EconomySection from './EconomySection';
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
  const formContext = useFormContext<EventFormDto>();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousValuesRef = useRef<EventFormDto | null>(null);

  // Guard against missing form context (can happen during hydration)
  const watch = formContext?.watch;
  const getValues = formContext?.getValues;

  useEffect(() => {
    if (!watch || !getValues) return;

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

// Save button component that has access to form context
const SaveButton = ({ onSave }: { onSave: (data: EventFormDto) => Promise<void> }) => {
  const formContext = useFormContext<EventFormDto>();
  const [isSaving, setIsSaving] = useState(false);
  const t = useTranslations();

  // Guard against missing form context
  if (!formContext) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = formContext.getValues();
      await onSave(data);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-6 flex justify-end">
      <Button onClick={handleSave} loading={isSaving} testId="event-save-button" variant="primary">
        {t('common.buttons.save')}
      </Button>
    </div>
  );
};

type EventPageTabsProps = {
  eventinfo: EventDto;
  participants: RegistrationDto[];
  statistics: EventStatisticsDto;
  eventProducts: ProductDto[];
  notifications: NotificationDto[];
  defaultTab?:
    | 'participants'
    | 'overview'
    | 'dates'
    | 'descriptions'
    | 'certificate'
    | 'advanced'
    | 'communication'
    | 'products'
    | 'economy';
};

export default function EventPageTabs({
  eventinfo,
  participants,
  statistics,
  eventProducts,
  notifications,
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
          <SaveButton onSave={handleAutoSave} />
        </Tabs.Item>

        <Tabs.Item id="dates" title={t('admin.events.tabs.dates')} testId="tab-dates">
          <DatesLocationSection />
          <SaveButton onSave={handleAutoSave} />
        </Tabs.Item>

        <Tabs.Item
          id="descriptions"
          title={t('admin.events.tabs.descriptions')}
          testId="tab-descriptions"
        >
          <DescriptionsSection />
          <SaveButton onSave={handleAutoSave} />
        </Tabs.Item>

        <Tabs.Item
          id="certificate"
          title={t('admin.events.tabs.certificate')}
          testId="tab-certificate"
        >
          <CertificateSection eventinfo={eventinfo} />
          <SaveButton onSave={handleAutoSave} />
        </Tabs.Item>

        <Tabs.Item
          id="communication"
          title={t('admin.events.tabs.communication')}
          testId="tab-communication"
        >
          <CommunicationSection eventinfo={eventinfo} notifications={notifications} />
        </Tabs.Item>

        <Tabs.Item id="products" title={t('admin.events.tabs.products')} testId="tab-products">
          <EventProductsEditor eventInfo={eventinfo} products={eventProducts} />
        </Tabs.Item>

        <Tabs.Item id="advanced" title={t('admin.events.tabs.advanced')} testId="tab-advanced">
          <AdvancedSection eventId={eventinfo.id} />
          <SaveButton onSave={handleAutoSave} />
        </Tabs.Item>

        <Tabs.Item id="economy" title={t('admin.events.tabs.economy')} testId="tab-economy">
          <EconomySection participants={participants} />
        </Tabs.Item>
      </Tabs>
    </Form>
  );
}
