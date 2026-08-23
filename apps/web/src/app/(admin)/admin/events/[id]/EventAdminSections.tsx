'use client';

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Logger } from '@eventuras/logger';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { ErrorBoundary } from '@eventuras/ratio-ui/core/ErrorBoundary';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Tabs } from '@eventuras/ratio-ui/core/Tabs';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { ActionBar } from '@eventuras/ratio-ui/layout/ActionBar';
import { useToast } from '@eventuras/ratio-ui/toast';
import { Form, useFormContext } from '@eventuras/smartform';

import {
  DEFAULT_EVENT_ADMIN_TAB,
  type EventAdminTab,
  type EventEditTab,
  isEventAdminTab,
  sectionForTab,
} from '@/components/admin/shell';
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
import EventDashboardSection from './EventDashboardSection';
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
import { AdminCertificatesActionsMenu } from '../AdminCertificatesActionsMenu';

// Isolates a section's content so a crash there doesn't propagate to the page boundary.
const SectionErrorBoundary = ({ tabId, children }: { tabId: string; children: ReactNode }) => (
  <ErrorBoundary
    onError={(error, info) => {
      const logger = Logger.create({
        namespace: 'web:admin:events',
        context: { section: 'admin', tab: tabId },
      });
      logger.error(
        {
          error: { message: error.message, stack: error.stack },
          componentStack: info.componentStack,
        },
        'Tab content crashed'
      );
      Sentry.captureException(error, {
        tags: { section: 'admin', tab: tabId },
        extra: { componentStack: info.componentStack },
      });
    }}
  >
    {children}
  </ErrorBoundary>
);

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

// Action bar with save button, optionally with extra actions on the left
const SaveActionBar = ({
  onSave,
  children,
}: {
  onSave: (data: EventFormDto) => Promise<void>;
  children?: ReactNode;
}) => {
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
    <ActionBar>
      {children}
      <ActionBar.Spacer />
      <Button onClick={handleSave} loading={isSaving} testId="event-save-button" variant="primary">
        {t('common.buttons.save')}
      </Button>
    </ActionBar>
  );
};

type EventAdminSectionsProps = {
  eventinfo: EventDto;
  participants: RegistrationDto[];
  statistics: EventStatisticsDto;
  eventProducts: ProductDto[];
  notifications: NotificationDto[];
  organizationId: number;
  defaultTab?: EventAdminTab;
};

/**
 * Renders the section of the event admin page selected by `?tab=`. The admin
 * sidebar is the section navigation; only the five editor tabs keep a tab
 * strip, inside the "edit" section.
 */
export default function EventAdminSections({
  eventinfo,
  participants,
  statistics,
  eventProducts,
  notifications,
  organizationId,
  defaultTab = DEFAULT_EVENT_ADMIN_TAB,
}: Readonly<EventAdminSectionsProps>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const toast = useToast();
  const [isMounted, setIsMounted] = useState(false);

  const logger = Logger.create({
    namespace: 'web:admin:events',
    context: { component: 'EventAdminSections', eventId: eventinfo.id },
  });

  // Ensure component is mounted before rendering form
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get current tab from URL or use default
  const tabParam = searchParams.get('tab');
  const currentTab: EventAdminTab = isEventAdminTab(tabParam) ? tabParam : defaultTab;
  const section = sectionForTab(currentTab);

  const handleEditTabChange = (newTab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Auto-save handler
  const handleAutoSave = useCallback(
    async (data: EventFormDto) => {
      logger.info({ autoSave: true }, 'Auto-saving event...');

      const orgId = organizationId;
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

  const isEditSection = section.key === 'edit';

  // Don't render until mounted to avoid hydration/context issues
  if (!isMounted) {
    return <div className="p-4">Loading...</div>;
  }

  const sectionTitle = t(section.labelKey);

  const editTabs: { id: EventEditTab; content: ReactNode; actions?: ReactNode }[] = [
    { id: 'overview', content: <OverviewSection organizationId={organizationId} /> },
    { id: 'dates', content: <DatesLocationSection /> },
    { id: 'descriptions', content: <DescriptionsSection /> },
    {
      id: 'certificate',
      content: <CertificateSection />,
      actions: <AdminCertificatesActionsMenu eventinfo={eventinfo} />,
    },
    { id: 'advanced', content: <AdvancedSection /> },
  ];

  const renderSection = () => {
    switch (section.key) {
      case 'dashboard':
        return (
          <EventDashboardSection
            eventinfo={eventinfo}
            participants={participants}
            statistics={statistics}
            notifications={notifications}
          />
        );
      case 'participants':
        return (
          <ParticipantsSection
            eventInfo={eventinfo}
            participants={participants}
            statistics={statistics}
            eventProducts={eventProducts}
          />
        );
      case 'communication':
        return <CommunicationSection eventinfo={eventinfo} notifications={notifications} />;
      case 'products':
        return <EventProductsEditor eventInfo={eventinfo} products={eventProducts} />;
      case 'economy':
        return <EconomySection participants={participants} />;
      case 'edit':
        return (
          <Tabs selectedKey={currentTab} onSelectionChange={handleEditTabChange}>
            {editTabs.map(tab => (
              <Tabs.Item
                key={tab.id}
                id={tab.id}
                title={t(`admin.events.tabs.${tab.id}`)}
                testId={`tab-${tab.id}`}
              >
                <SectionErrorBoundary tabId={tab.id}>
                  {tab.content}
                  <SaveActionBar onSave={handleAutoSave}>{tab.actions}</SaveActionBar>
                </SectionErrorBoundary>
              </Tabs.Item>
            ))}
          </Tabs>
        );
    }
  };

  return (
    <Form
      defaultValues={eventinfo}
      testId="event-edit-form"
      shouldUnregister={false}
      onSubmit={() => {
        // No-op: auto-save handles all updates
      }}
    >
      {isEditSection && <AutoSaveHandler onAutoSave={handleAutoSave} />}

      <Heading.Group className="mb-6">
        <Text
          as="p"
          family="mono"
          size="sm"
          variant="subtle"
          marginBottom="none"
          testId="event-admin-eyebrow"
        >
          {eventinfo.title}
        </Text>
        <Heading as="h1" marginTop="none" testId="event-admin-section-title">
          {sectionTitle}
        </Heading>
      </Heading.Group>

      <SectionErrorBoundary tabId={section.key}>{renderSection()}</SectionErrorBoundary>
    </Form>
  );
}
