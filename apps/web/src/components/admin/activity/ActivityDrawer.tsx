'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import type { ServerActionResult } from '@eventuras/core-nextjs/actions';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Loading } from '@eventuras/ratio-ui/core/Loading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { ToggleButtonGroup } from '@eventuras/ratio-ui/core/ToggleButtonGroup';
import { Drawer } from '@eventuras/ratio-ui/layout/Drawer';
import { Stack } from '@eventuras/ratio-ui/layout/Stack';

import type { BusinessEventDto } from '@/lib/eventuras-sdk';

import { fetchEventActivity } from './activityActions';
import { useActivityDrawer } from './ActivityDrawerProvider';
import { ActivityTimeline } from './ActivityTimeline';
import {
  ACTIVITY_SUBJECTS,
  type ActivityFilter,
  matchesActivityFilter,
} from './businessEventPresentation';
import { usePinnedEvent } from '../shell/PinnedEvent';

type LoadResult = { key: string; events?: BusinessEventDto[]; error?: string };

type ActivityDrawerProps = {
  /** Data source; defaults to the server action. Swappable for previews and tests. */
  loader?: (eventUuid: string) => Promise<ServerActionResult<BusinessEventDto[]>>;
};

/**
 * The pinned event's activity log — every business event on the event, its
 * registrations and orders — in a drawer that overlays whatever section the
 * admin is on. Loads when opened; "refresh" reloads (no live push yet).
 */
export function ActivityDrawer({
  loader = fetchEventActivity,
}: Readonly<ActivityDrawerProps> = {}) {
  const t = useTranslations();
  const { event } = usePinnedEvent();
  const { isOpen, close } = useActivityDrawer();
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [reload, setReload] = useState(0);
  const [result, setResult] = useState<LoadResult | null>(null);

  const uuid = event?.uuid;
  const key = `${uuid}:${reload}`;
  const current = result?.key === key ? result : null;
  const loading = isOpen && !!uuid && !current;

  useEffect(() => {
    if (!isOpen || !uuid) return;
    let cancelled = false;
    loader(uuid)
      .then(response => {
        if (cancelled) return;
        setResult(
          response.success ? { key, events: response.data } : { key, error: response.error.message }
        );
      })
      .catch((error: unknown) => {
        if (!cancelled)
          setResult({ key, error: error instanceof Error ? error.message : String(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, uuid, key, loader]);

  const visible = (current?.events ?? []).filter(e => matchesActivityFilter(e, filter));

  return (
    <Drawer isOpen={isOpen} onClose={close} side="right">
      <Drawer.Header as="h2">{t('admin.businessEvents.title')}</Drawer.Header>
      <Drawer.Body>
        <Stack gap="md">
          {event && (
            <Text as="p" family="mono" size="sm" variant="subtle" marginBottom="none">
              {event.title}
            </Text>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <ToggleButtonGroup
              aria-label={t('admin.businessEvents.filterLabel')}
              size="sm"
              selectedKeys={[filter]}
              disallowEmptySelection
              onSelectionChange={keys => setFilter(([...keys][0] as ActivityFilter) ?? 'all')}
              options={[
                { value: 'all', label: t('admin.businessEvents.filters.all') },
                ...ACTIVITY_SUBJECTS.map(subject => ({
                  value: subject,
                  label: t(`admin.businessEvents.filters.${subject}`),
                })),
              ]}
              testId="activity-filter"
            />
            <Button
              variant="text"
              size="sm"
              className="ml-auto"
              loading={loading}
              onClick={() => setReload(n => n + 1)}
              testId="activity-refresh"
            >
              {t('admin.businessEvents.refresh')}
            </Button>
          </div>
          {!uuid ? (
            <Text as="p" size="sm" variant="subtle">
              {t('admin.businessEvents.noEvent')}
            </Text>
          ) : loading ? (
            <Loading />
          ) : current?.error ? (
            <Text as="p" size="sm" color="error">
              {t('admin.businessEvents.loadError')}
            </Text>
          ) : (
            <ActivityTimeline events={visible} testId="activity-timeline" />
          )}
        </Stack>
      </Drawer.Body>
    </Drawer>
  );
}
